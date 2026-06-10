// Hero: 4-DOF robotic arm solving CCD IK toward the cursor, rendered in Three.js.
// Exposes onTelemetry(j1..j4 deg, eeErr m) so the DOM telemetry strip shows real solver state.
import * as THREE from 'three'

const ACCENT = 0xff4d00
const DARK = 0x16191d
const LIGHTMETAL = 0x2a2f35

function makeLink(length, radius) {
  const g = new THREE.Group()
  const geo = new THREE.CylinderGeometry(radius, radius * 0.82, length, 24)
  geo.translate(0, length / 2, 0)
  const mat = new THREE.MeshStandardMaterial({ color: DARK, metalness: 0.85, roughness: 0.35 })
  g.add(new THREE.Mesh(geo, mat))
  // accent ring near the joint
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.08, radius * 0.1, 12, 32),
    new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.4 })
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = length * 0.12
  g.add(ring)
  return g
}

function makeJoint(radius) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 24),
    new THREE.MeshStandardMaterial({ color: LIGHTMETAL, metalness: 0.9, roughness: 0.3 })
  )
}

export class HeroArm {
  constructor(canvas, { onTelemetry } = {}) {
    this.canvas = canvas
    this.onTelemetry = onTelemetry
    this.running = false
    this.mouse = null // NDC target from pointer
    this.t = 0
    this.lastTime = 0

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer = renderer

    const scene = new THREE.Scene()
    this.scene = scene

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0.6, 2.2, 6.1)
    camera.lookAt(0, 1.8, 0)
    this.camera = camera

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(4, 6, 5)
    scene.add(key)
    const rim = new THREE.PointLight(ACCENT, 14, 12)
    rim.position.set(-3, 1.2, -2)
    scene.add(rim)
    const fill = new THREE.PointLight(0x59d4e8, 5, 14)
    fill.position.set(3.5, 4, -3)
    scene.add(fill)

    // Floor grid
    const grid = new THREE.GridHelper(16, 32, 0x2a2f35, 0x16191d)
    grid.position.y = 0
    grid.material.transparent = true
    grid.material.opacity = 0.5
    scene.add(grid)

    // ----- Kinematic chain: yaw base + 3 pitch joints -----
    this.L = [1.35, 1.15, 0.78]

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.7, 0.36, 32),
      new THREE.MeshStandardMaterial({ color: DARK, metalness: 0.8, roughness: 0.4 })
    )
    pedestal.position.y = 0.18
    scene.add(pedestal)
    const pedestalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.035, 12, 48),
      new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.6 })
    )
    pedestalRing.rotation.x = Math.PI / 2
    pedestalRing.position.y = 0.37
    scene.add(pedestalRing)

    this.yaw = new THREE.Group()
    this.yaw.position.y = 0.36
    scene.add(this.yaw)

    this.j1 = new THREE.Group() // shoulder
    this.j1.position.y = 0.22
    this.j1.add(makeJoint(0.3))
    this.j1.add(makeLink(this.L[0], 0.17))
    this.yaw.add(this.j1)

    this.j2 = new THREE.Group() // elbow
    this.j2.position.y = this.L[0]
    this.j2.add(makeJoint(0.22))
    this.j2.add(makeLink(this.L[1], 0.13))
    this.j1.add(this.j2)

    this.j3 = new THREE.Group() // wrist
    this.j3.position.y = this.L[1]
    this.j3.add(makeJoint(0.16))
    this.j3.add(makeLink(this.L[2], 0.09))
    this.j2.add(this.j3)

    // End effector: two-finger gripper
    this.ee = new THREE.Group()
    this.ee.position.y = this.L[2]
    const fingerGeo = new THREE.BoxGeometry(0.05, 0.3, 0.1)
    fingerGeo.translate(0, 0.15, 0)
    const fingerMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.4 })
    this.f1 = new THREE.Mesh(fingerGeo, fingerMat); this.f1.position.x = 0.1
    this.f2 = new THREE.Mesh(fingerGeo, fingerMat); this.f2.position.x = -0.1
    this.ee.add(this.f1, this.f2)
    this.j3.add(this.ee)

    // initial pose
    this.j1.rotation.z = -0.45
    this.j2.rotation.z = 0.85
    this.j3.rotation.z = 0.4

    // Target marker (where the arm is reaching)
    this.marker = new THREE.Group()
    const mRing = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.13, 32),
      new THREE.MeshBasicMaterial({ color: ACCENT, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    )
    this.marker.add(mRing)
    const mDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf2f3f5 }))
    this.marker.add(mDot)
    scene.add(this.marker)

    this.target = new THREE.Vector3(2, 2, 0)
    this.smoothTarget = this.target.clone()

    // pointer handling on the whole window (hero occupies viewport on load)
    this._onPointer = (e) => {
      const r = canvas.getBoundingClientRect()
      if (r.width === 0) return
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1)
      this.mouse = { nx, ny, at: performance.now() }
    }
    window.addEventListener('pointermove', this._onPointer, { passive: true })

    // click inside the hero stage = "lock & grab"; double-click = wave
    this.grabUntil = 0
    this.waveAt = -10
    this._onClick = (e) => {
      const r = canvas.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
      this.grabUntil = performance.now() + 900
    }
    this._onDblClick = (e) => {
      const r = canvas.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
      this.waveAt = this.t
    }
    window.addEventListener('pointerdown', this._onClick)
    window.addEventListener('dblclick', this._onDblClick)

    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
    this.resize()

    this._raf = this._raf || null
    this._tmpV1 = new THREE.Vector3()
    this._tmpV2 = new THREE.Vector3()
    this._eePos = new THREE.Vector3()
    this._jPos = new THREE.Vector3()

    // power state (1 = live, 0 = standby) — driven by scroll via setPower()
    this.power = 1
    this.powerSm = 1
    this.glowMats = []
    this.scene.traverse((o) => {
      if (o.material && o.material.emissive && o.material.emissiveIntensity > 0) {
        this.glowMats.push({ mat: o.material, base: o.material.emissiveIntensity })
      }
    })

    // cursor-grab easter egg state
    this.grabSeq = null
    this.lastGrabAt = -1e9
  }

  setPower(p) { this.power = THREE.MathUtils.clamp(p, 0, 1) }

  // If the visitor parks the cursor over the hero for ~2s, the arm reaches out,
  // pinches, and "drags" the reticle a few pixels before letting go.
  maybeGrabCursor(dt) {
    const now = performance.now()
    if (!this.grabSeq) {
      const idle = this.mouse && now - this.mouse.at > 2100 && now - this.mouse.at < 3500
      const inStage = this.mouse && Math.abs(this.mouse.nx) <= 1 && Math.abs(this.mouse.ny) <= 1
      if (idle && inStage && this.powerSm > 0.8 && now - this.lastGrabAt > 9000) {
        this.grabSeq = { t: 0, phase: 'reach' }
      }
      return
    }
    const g = this.grabSeq
    g.t += dt
    this.ee.getWorldPosition(this._eePos)
    const err = this._eePos.distanceTo(this.smoothTarget)
    if (g.phase === 'reach') {
      this.grabUntil = now + 200 // keep solver gain high
      if (err < 0.18 || g.t > 1.6) { g.phase = 'hold'; g.t = 0 }
    } else if (g.phase === 'hold') {
      this.grabUntil = now + 200
      if (g.t > 0.3) { g.phase = 'drag'; g.t = 0 }
    } else if (g.phase === 'drag') {
      this.grabUntil = now + 200
      const f = Math.min(g.t / 0.7, 1)
      const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2
      // tug the target (and the visitor's reticle) sideways
      this.target.x -= 0.9 * e * dt * 3
      window.dispatchEvent(new CustomEvent('mra:grab-offset', { detail: { dx: -44 * e, dy: 10 * e } }))
      if (f >= 1) { g.phase = 'release'; g.t = 0 }
    } else if (g.phase === 'release') {
      window.dispatchEvent(new CustomEvent('mra:grab-offset', { detail: { dx: 0, dy: 0 } }))
      this.lastGrabAt = now
      this.grabSeq = null
    }
  }

  resize() {
    const r = this.canvas.getBoundingClientRect()
    const w = Math.max(1, r.width), h = Math.max(1, r.height)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  // Map pointer/idle to a 3D reach target in the arm's workspace
  updateTarget(dt) {
    this.t += dt
    const idleStale = !this.mouse || performance.now() - this.mouse.at > 3500
    if (idleStale) {
      // graceful lissajous patrol
      this.target.set(
        2.1 * Math.sin(this.t * 0.45),
        1.7 + 1.05 * Math.sin(this.t * 0.7 + 1.2),
        0.8 * Math.sin(this.t * 0.3)
      )
    } else {
      const { nx, ny } = this.mouse
      this.target.set(nx * 2.6, THREE.MathUtils.clamp(1.6 + ny * 1.9, 0.25, 3.4), nx * -0.4)
    }
    // keep the target inside a reachable annulus around the shoulder so the
    // chain never folds through itself chasing an impossible point
    const shoulder = this._tmpV2.set(0, 0.58, 0)
    const rel = this.target.clone().sub(shoulder)
    const reach = THREE.MathUtils.clamp(rel.length(), 1.15, (this.L[0] + this.L[1] + this.L[2]) * 0.96)
    this.target.copy(shoulder).addScaledVector(rel.normalize(), reach)

    this.smoothTarget.lerp(this.target, 1 - Math.exp(-dt * 6))
    this.marker.position.copy(this.smoothTarget)
    this.marker.lookAt(this.camera.position)

    // grab: fingers pinch + marker locks; wave: wrist oscillation overlay
    const grabbing = performance.now() < this.grabUntil
    const fx = grabbing ? 0.045 : 0.1
    this.f1.position.x += (fx - this.f1.position.x) * 0.25
    this.f2.position.x += (-fx - this.f2.position.x) * 0.25
    const s = grabbing ? 0.7 : 1 + 0.12 * Math.sin(this.t * 4)
    this.marker.scale.set(s, s, s)
    this.marker.children[0].material.color.set(grabbing ? 0x3ddc97 : ACCENT)
  }

  // One CCD pass per frame, joints constrained to their axes
  solveIK() {
    // base yaw: rotate toward target azimuth (lag for weight)
    const az = Math.atan2(-this.smoothTarget.z, this.smoothTarget.x) - Math.PI / 2
    const targetYaw = THREE.MathUtils.clamp(-az - Math.PI / 2 + Math.PI / 2, -1.2, 1.2)
    this.yaw.rotation.y += (Math.atan2(this.smoothTarget.z * -1, this.smoothTarget.x) * 0 + targetYaw - this.yaw.rotation.y) * 0.08

    // elbow floor (0.3 rad) prevents the forearm folding back through the upper arm
    const joints = [this.j3, this.j2, this.j1]
    const limits = [[-1.7, 1.7], [0.3, 2.45], [-1.25, 1.25]]
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < joints.length; i++) {
        const j = joints[i]
        this.ee.getWorldPosition(this._eePos)
        j.getWorldPosition(this._jPos)
        // joint axis = local Z in world space
        const axis = this._tmpV1.set(0, 0, 1).applyQuaternion(j.getWorldQuaternion(new THREE.Quaternion())).normalize()
        const toEE = this._eePos.clone().sub(this._jPos).projectOnPlane(axis)
        const toT = this.smoothTarget.clone().sub(this._jPos).projectOnPlane(axis)
        if (toEE.lengthSq() < 1e-6 || toT.lengthSq() < 1e-6) continue
        toEE.normalize(); toT.normalize()
        let angle = Math.acos(THREE.MathUtils.clamp(toEE.dot(toT), -1, 1))
        const cross = this._tmpV2.copy(toEE).cross(toT)
        if (cross.dot(axis) < 0) angle = -angle
        const gain = performance.now() < this.grabUntil ? 0.8 : 0.55
        const next = THREE.MathUtils.clamp(j.rotation.z + angle * gain, limits[i][0], limits[i][1])
        j.rotation.z = next
      }
    }
    // double-click wave: damped wrist oscillation layered on the IK pose
    const wt = this.t - this.waveAt
    if (wt >= 0 && wt < 1.4) {
      this.j3.rotation.z += Math.sin(wt * 18) * 0.5 * Math.exp(-wt * 2.2)
    }
  }

  emitTelemetry() {
    if (!this.onTelemetry) return
    this.ee.getWorldPosition(this._eePos)
    const err = this._eePos.distanceTo(this.smoothTarget)
    this.onTelemetry({
      j1: THREE.MathUtils.radToDeg(this.yaw.rotation.y),
      j2: THREE.MathUtils.radToDeg(this.j1.rotation.z),
      j3: THREE.MathUtils.radToDeg(this.j2.rotation.z),
      j4: THREE.MathUtils.radToDeg(this.j3.rotation.z),
      err,
    })
  }

  loop = (time) => {
    if (!this.running) return
    const dt = Math.min((time - this.lastTime) / 1000 || 0.016, 0.05)
    this.lastTime = time
    this.updateTarget(dt)
    this.maybeGrabCursor(dt)

    this.powerSm += (this.power - this.powerSm) * Math.min(dt * 4, 1)
    if (this.powerSm > 0.25) this.solveIK()
    // power-down: slump toward a rest pose, fade the joint glows
    const off = 1 - this.powerSm
    if (off > 0.01) {
      const w = off * 0.08
      this.yaw.rotation.y += (0.45 - this.yaw.rotation.y) * w
      this.j1.rotation.z += (-1.05 - this.j1.rotation.z) * w
      this.j2.rotation.z += (2.4 - this.j2.rotation.z) * w
      this.j3.rotation.z += (1.1 - this.j3.rotation.z) * w
    }
    this.glowMats.forEach(({ mat, base }) => { mat.emissiveIntensity = base * (0.08 + 0.92 * this.powerSm) })
    this.marker.visible = this.powerSm > 0.45
    // subtle camera parallax
    const px = this.mouse ? this.mouse.nx : 0
    this.camera.position.x += (0.6 + px * 0.5 - this.camera.position.x) * 0.03
    this.camera.lookAt(0, 1.8, 0)
    this.renderer.render(this.scene, this.camera)
    if ((this._teleTick = (this._teleTick || 0) + 1) % 4 === 0) this.emitTelemetry()
    this._raf = requestAnimationFrame(this.loop)
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this._raf = requestAnimationFrame(this.loop)
  }

  stop() {
    this.running = false
    if (this._raf) cancelAnimationFrame(this._raf)
  }

  destroy() {
    this.stop()
    window.removeEventListener('pointermove', this._onPointer)
    window.removeEventListener('pointerdown', this._onClick)
    window.removeEventListener('dblclick', this._onDblClick)
    window.removeEventListener('resize', this._onResize)
    this.renderer.dispose()
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
    })
  }
}
