import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Cena 3D auto-contida de uma bola de futebol com física 2D realista em
 * espaço de tela (pixels). A bola cai do topo, quica nos cards/formulário
 * (elementos marcados com [data-football-collider]) e pode ser arrastada
 * com mouse ou toque.
 *
 * Coordenadas de mundo = pixels da viewport, com Y invertido (Y para cima):
 *   worldX = screenX, worldY = -screenY.
 * Câmera ortográfica mapeia 1:1 com a tela, então a bola fica exatamente
 * sobre o layout HTML.
 */

interface FootballSceneOptions {
  canvas: HTMLCanvasElement
  ballUrl: string
  /** Seletor dos elementos com os quais a bola colide. */
  colliderSelector?: string
}

interface Rect {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

const GRAVITY = 2600 // px/s²
const RESTITUTION = 0.62 // energia mantida ao quicar
const TANGENT_FRICTION = 0.82 // atrito tangencial no impacto
const AIR_DAMPING = 0.25 // amortecimento do ar (por segundo)
const REST_SPEED = 12 // abaixo disso, considera parada (anti-jitter)
const FIXED_DT = 1 / 120 // passo fixo de simulação
const MAX_FRAME_DT = 0.05 // evita "espiral da morte" após abas inativas
const SPIN_BLEND = 12 // rapidez com que o giro casa com a rolagem na superfície
const SPIN_AIR_DAMPING = 0.2 // amortecimento do giro em voo (por segundo)
const SPIN_REST_DAMPING = 16 // freia o giro quando a bola está em repouso
const DRAG_STALE = 0.04 // s sem mover o ponteiro => arrasto considerado parado
const SPIN_SCALE = 0.7 // intensidade do tombamento (1 = rolagem física pura)

export class FootballScene {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.OrthographicCamera
  private readonly colliderSelector: string

  private pivot: THREE.Group | null = null
  private radius = 46

  // estado físico (coordenadas de mundo)
  private x = 0
  private y = 0
  private vx = 0
  private vy = 0

  // arrasto
  private dragging = false
  private dragId: number | null = null
  private lastPointer = { x: 0, y: 0, t: 0 }

  private colliders: Rect[] = []
  private width = 0
  private height = 0

  // giro como estado físico: velocidade angular (rad/s) em eixos de mundo.
  // O eixo fica no plano da tela (X/Y), então a bola "tomba" e revela seu
  // volume 3D em vez de girar achatada em torno de Z.
  private readonly omega = new THREE.Vector3()
  // contato neste passo (normal da superfície em coords de mundo, e flags)
  private inContact = false
  private contactNX = 0
  private contactNY = 0
  // apoiada numa superfície horizontal (normal para cima) => repouso/anti-jitter
  private onSurface = false

  private rafId = 0
  private accumulator = 0
  private prevTime = 0
  private disposed = false

  private readonly tmpQuat = new THREE.Quaternion()
  private readonly tmpAxis = new THREE.Vector3()

  constructor(options: FootballSceneOptions) {
    this.colliderSelector = options.colliderSelector ?? '[data-football-collider]'

    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      alpha: true,
      antialias: true,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(0, 1, 0, -1, 0.1, 1000)
    this.camera.position.z = 500

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(-0.6, 1, 0.8)
    this.scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.8)
    fill.position.set(0.8, -0.4, 0.5)
    this.scene.add(fill)

    this.resize()

    // estado inicial: bola acima do topo da tela, no centro horizontal
    this.radius = Math.min(46, this.width * 0.11)
    this.x = this.width / 2
    this.y = this.radius + 60 // > 0 => acima da viewport (cai para dentro)

    this.loadBall(options.ballUrl)

    window.addEventListener('resize', this.resize)
    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)
    // impede o scroll da página enquanto arrasta a bola no touch
    window.addEventListener('touchmove', this.onTouchMove, { passive: false })
    // impede a seleção de texto enquanto arrasta a bola
    window.addEventListener('selectstart', this.onSelectStart)
    document.addEventListener('visibilitychange', this.onVisibility)

    this.prevTime = performance.now()
    this.rafId = requestAnimationFrame(this.loop)
  }

  private loadBall(url: string) {
    new GLTFLoader().load(url, gltf => {
      if (this.disposed) return
      const model = gltf.scene

      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      const scale = (this.radius * 2) / maxDim
      model.scale.setScalar(scale)
      // centraliza o modelo na origem do pivô (rotação em torno do centro)
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

      this.pivot = new THREE.Group()
      this.pivot.add(model)
      this.scene.add(this.pivot)
    })
  }

  private readonly resize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.renderer.setSize(this.width, this.height, false)
    this.camera.left = 0
    this.camera.right = this.width
    this.camera.top = 0
    this.camera.bottom = -this.height
    this.camera.updateProjectionMatrix()
  }

  /** Lê os retângulos dos colliders do DOM (em coordenadas de mundo, Y para cima). */
  private syncColliders() {
    const els = document.querySelectorAll<HTMLElement>(this.colliderSelector)
    const rects: Rect[] = []
    els.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      rects.push({ xmin: r.left, xmax: r.right, ymin: -r.bottom, ymax: -r.top })
    })
    this.colliders = rects
  }

  private resolveRect(rect: Rect) {
    const closestX = Math.max(rect.xmin, Math.min(this.x, rect.xmax))
    const closestY = Math.max(rect.ymin, Math.min(this.y, rect.ymax))
    let dx = this.x - closestX
    let dy = this.y - closestY
    let d2 = dx * dx + dy * dy
    const r = this.radius

    if (d2 >= r * r) return

    let nx: number
    let ny: number
    let pen: number

    if (d2 > 1e-6) {
      const d = Math.sqrt(d2)
      nx = dx / d
      ny = dy / d
      pen = r - d
    } else {
      // centro dentro do retângulo: empurra pelo eixo de menor penetração
      const left = this.x - rect.xmin
      const right = rect.xmax - this.x
      const bottom = this.y - rect.ymin
      const top = rect.ymax - this.y
      const min = Math.min(left, right, bottom, top)
      if (min === left) { nx = -1; ny = 0 }
      else if (min === right) { nx = 1; ny = 0 }
      else if (min === bottom) { nx = 0; ny = -1 }
      else { nx = 0; ny = 1 }
      pen = r + min
    }

    // correção de posição
    this.x += nx * pen
    this.y += ny * pen

    // registra o contato (normal de mundo) para a rolagem; normal para cima
    // também marca apoio horizontal (repouso/anti-jitter)
    this.inContact = true
    this.contactNX = nx
    this.contactNY = ny
    if (ny > 0.5) this.onSurface = true

    // reflexão da velocidade ao longo da normal
    const vn = this.vx * nx + this.vy * ny
    if (vn < 0) {
      const tx = -ny
      const ty = nx
      const vt = this.vx * tx + this.vy * ty
      const newVn = -vn * RESTITUTION
      const newVt = vt * TANGENT_FRICTION
      this.vx = newVn * nx + newVt * tx
      this.vy = newVn * ny + newVt * ty
    }
  }

  private substep(dt: number) {
    if (this.dragging) return
    this.onSurface = false
    this.inContact = false

    // gravidade + amortecimento do ar
    this.vy -= GRAVITY * dt
    const damp = Math.max(0, 1 - AIR_DAMPING * dt)
    this.vx *= damp
    this.vy *= damp

    this.x += this.vx * dt
    this.y += this.vy * dt

    // paredes da viewport (esquerda, direita, chão)
    const r = this.radius
    if (this.x < r) {
      this.x = r
      if (this.vx < 0) this.vx = -this.vx * RESTITUTION
      this.inContact = true
      this.contactNX = 1
      this.contactNY = 0
    } else if (this.x > this.width - r) {
      this.x = this.width - r
      if (this.vx > 0) this.vx = -this.vx * RESTITUTION
      this.inContact = true
      this.contactNX = -1
      this.contactNY = 0
    }
    const floor = -this.height + r
    if (this.y < floor) {
      this.y = floor
      if (this.vy < 0) this.vy = -this.vy * RESTITUTION
      this.vx *= TANGENT_FRICTION
    }
    if (this.y <= floor + 0.5) {
      this.onSurface = true
      this.inContact = true
      this.contactNX = 0
      this.contactNY = 1
    }

    for (const rect of this.colliders) this.resolveRect(rect)

    // anti-jitter: zera micro-velocidades quando praticamente parada sobre
    // qualquer superfície de apoio (chão ou card), não só o chão
    if (this.onSurface && Math.abs(this.vy) < REST_SPEED) {
      this.vy = 0
      if (Math.abs(this.vx) < REST_SPEED) this.vx = 0
    }
  }

  /**
   * Evolui a velocidade angular (`omega`) e a aplica ao pivô.
   *
   * O giro é um **tombamento 3D**: o eixo fica no plano da tela, perpendicular
   * ao movimento, então a esfera rola revelando seu volume (não fica achatada
   * girando em torno de Z). O alvo segue ω = (vy/R, -vx/R, 0).
   *
   * Para não exagerar no quique, usa-se apenas a velocidade **tangencial** à
   * superfície de contato: a componente normal (o impacto vertical do pique)
   * NÃO gera giro. Assim um quique reto não tomba a bola, mas qualquer
   * movimento lateral a faz rolar de forma natural.
   *
   * - Em contato: tomba conforme a velocidade tangencial à superfície.
   * - Arrastada: tomba seguindo o movimento da mão.
   * - Em voo: conserva o giro com leve amortecimento do ar.
   * - Em repouso: o giro é freado rapidamente, então a bola parada não gira.
   */
  private updateSpin(dt: number) {
    if (!this.pivot) return

    const k = Math.min(1, SPIN_BLEND * dt)
    if (this.dragging) {
      // arrasto: tomba seguindo o movimento da mão
      this.approachRoll(this.vx, this.vy, k)
    } else if (this.inContact) {
      // rolagem: só a componente tangencial à superfície gera giro
      const vn = this.vx * this.contactNX + this.vy * this.contactNY
      this.approachRoll(this.vx - vn * this.contactNX, this.vy - vn * this.contactNY, k)
    } else {
      // em voo: conserva o giro com leve amortecimento do ar
      this.omega.multiplyScalar(Math.max(0, 1 - SPIN_AIR_DAMPING * dt))
    }

    // em repouso sobre uma superfície: freia o giro até parar
    if (this.onSurface && Math.hypot(this.vx, this.vy) < REST_SPEED) {
      this.omega.multiplyScalar(Math.max(0, 1 - SPIN_REST_DAMPING * dt))
    }

    const speed = this.omega.length()
    if (speed < 1e-4) return
    this.tmpAxis.copy(this.omega).multiplyScalar(1 / speed)
    this.tmpQuat.setFromAxisAngle(this.tmpAxis, speed * dt)
    this.pivot.quaternion.premultiply(this.tmpQuat)
  }

  /** Aproxima `omega` da rolagem 3D para a velocidade (vx, vy): eixo no plano,
   * perpendicular ao movimento — ω = (vy/R, -vx/R, 0) * SPIN_SCALE. */
  private approachRoll(vx: number, vy: number, k: number) {
    const tx = (vy / this.radius) * SPIN_SCALE
    const ty = (-vx / this.radius) * SPIN_SCALE
    this.omega.x += (tx - this.omega.x) * k
    this.omega.y += (ty - this.omega.y) * k
    this.omega.z += -this.omega.z * k
  }

  private readonly loop = () => {
    if (this.disposed) return
    const now = performance.now()
    let frameDt = (now - this.prevTime) / 1000
    this.prevTime = now
    if (frameDt > MAX_FRAME_DT) frameDt = MAX_FRAME_DT

    this.syncColliders()

    // arrasto parado: sem mover o ponteiro há um instante, zera a velocidade
    // estimada para que a bola segurada não gire (nem seja arremessada à toa)
    if (this.dragging && (now - this.lastPointer.t) / 1000 > DRAG_STALE) {
      this.vx = 0
      this.vy = 0
    }

    this.accumulator += frameDt
    while (this.accumulator >= FIXED_DT) {
      this.substep(FIXED_DT)
      this.accumulator -= FIXED_DT
    }
    this.updateSpin(frameDt)

    if (this.pivot) this.pivot.position.set(this.x, this.y, 0)
    this.renderer.render(this.scene, this.camera)
    this.rafId = requestAnimationFrame(this.loop)
  }

  // converte coordenadas de ponteiro (tela) para mundo (Y para cima)
  private isOnBall(clientX: number, clientY: number): boolean {
    const dx = clientX - this.x
    const dy = -clientY - this.y
    return dx * dx + dy * dy <= this.radius * this.radius
  }

  private readonly onPointerDown = (e: PointerEvent) => {
    if (this.dragging || !this.pivot) return
    if (!this.isOnBall(e.clientX, e.clientY)) return
    // evita iniciar uma seleção de texto ao agarrar a bola
    e.preventDefault()
    this.dragging = true
    this.dragId = e.pointerId
    this.vx = 0
    this.vy = 0
    this.lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() }
    // bloqueia a seleção de texto durante o arrasto
    document.body.style.userSelect = 'none'
  }

  private readonly onPointerMove = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.dragId) return
    const now = performance.now()
    const dt = (now - this.lastPointer.t) / 1000
    this.x = e.clientX
    this.y = -e.clientY
    // mantém dentro da viewport
    this.x = Math.max(this.radius, Math.min(this.x, this.width - this.radius))
    this.y = Math.max(-this.height + this.radius, Math.min(this.y, this.radius + 200))
    if (dt > 0) {
      this.vx = (e.clientX - this.lastPointer.x) / dt
      this.vy = -(e.clientY - this.lastPointer.y) / dt
    }
    this.lastPointer = { x: e.clientX, y: e.clientY, t: now }
  }

  private readonly onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.dragId) return
    this.dragging = false
    this.dragId = null
    // libera a seleção de texto ao soltar a bola
    document.body.style.userSelect = ''
    // limita a velocidade de arremesso
    const max = 4000
    this.vx = Math.max(-max, Math.min(this.vx, max))
    this.vy = Math.max(-max, Math.min(this.vy, max))
  }

  private readonly onTouchMove = (e: TouchEvent) => {
    if (this.dragging) e.preventDefault()
  }

  private readonly onSelectStart = (e: Event) => {
    if (this.dragging) e.preventDefault()
  }

  private readonly onVisibility = () => {
    // ao voltar para a aba, reinicia o relógio para não dar um salto enorme
    if (!document.hidden) this.prevTime = performance.now()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('selectstart', this.onSelectStart)
    document.removeEventListener('visibilitychange', this.onVisibility)
    // garante que a seleção de texto volte ao normal
    document.body.style.userSelect = ''

    this.scene.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material
      if (Array.isArray(material)) material.forEach(m => m.dispose())
      else if (material) material.dispose()
    })
    this.renderer.dispose()
  }
}
