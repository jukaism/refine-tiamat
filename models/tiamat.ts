export interface Plan {
  uuid: string,
  memo: string,
  teams: Team[]
}

export interface Room {
  id: number,
  zone: number, // 配置用の情報であり、ゲーム上の採点分けとは一致していない
  floor: number, // 階層。0で水路
  orix: number, // ゾーン内の位置。24段階で、あとで倍率をかける。
  oriy: number,
  name: string,
  map: string, // 元になったマップ
  x: number, // マップを切り抜くときのorigin
  y: number,
  height: number, // 切り抜きと表示両方に使用
  width: number,
  gimmicks: GimmickManager[]
}

export interface Team {
  id: number,
  name: string,
  move: (Move | GimmickManager)[],
  keys: Key[]
}

export interface Move {
  from: number, // map_id
  to: number // map_id
}

export interface Key {
  id: number,
  name: string
}

export interface Connection {
  from: number, // portal_id
  to: number // portal_id
}

export interface Portal {
  id: number,
  room_id: number,
  x: number, // Ooorinates on room
  y: number,
  require: number | null // NOTICE: Its gimmick_id, and are parts of Gimmicks request a Key.
  requireStatus: number, // gimmick.status
  sk: number | null, // WORKAROUND: Status Key ID このステータスがあればカギがかかっていても通れる
  desc: string
}

export interface Gimmick {
  id: number,
  name: string,
  status: number,
  desc: string
}

export interface GimmickManager {
  gimmick_id: number,
  x: number,
  y: number,
  actions: GimmickAction[],
  keyGain: Key | null,
  require: GimmickRequire[],
  key_id: number | null
}

export interface GimmickRequire {
  gimmick_id: number,
  status: number
}

export interface GimmickAction {
  gimmick_id: number,
  add: number,
  desc: string // ex: 水門①を開いた、天文台のカギを開けた、など
}

export interface RoomArrange {
  room_id: number,
  arranges: Arrange[]
}

export interface Arrange {
  x: number,
  y: number
}
