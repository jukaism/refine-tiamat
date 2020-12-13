<template>
  <div
    class="d-flex flex-column"
    :class="{ 'rotate-r': room.id === 125 }"
  >
    <div style="position: relative;">
      <div class="room-name"><span>{{ room.name }}</span></div>
      <div
        :id="`room${room.id}`"
        :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
        class="room-box"
      >
        <img
          :src="`/maps/${room.map}.png`"
          class="room-image"
          :style="{ left: `-${room.x}px`, top: `-${room.y}px` }"
        >
      </div>
      <v-tooltip
          v-for="(gim, gimI) in room.gimmicks"
          :key="'gim' + gimI"
          color="lime lighten-5" bottom
        >
        <template v-slot:activator="{ on }">
          <div
            v-on="on"
            style="user-select: none;"
          >
            <img
              :src="imgOfGim(gim)"
              class="gimmick-img"
              :class="{ 'rotate-l': room.id === 125 }"
              style="position: absolute;"
              :style="{ left: `${gim.x}px`, top: `${gim.y}px`, display: displayGimmick(gim) }"
              @click="clickGimmick(room.id, gim)"
            >
          </div>
        </template>
        <div style="color: black;">
          <div>
            <span v-html="gimmicks[gim.gimmick_id].name + '<br/>' + gimmicks[gim.gimmick_id].desc"></span>
          </div>
        </div>
      </v-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "nuxt-property-decorator"
import { Plan, Room, Team, Move, Key, Portal, Connection, Gimmick, GimmickManager, GimmickRequire, GimmickAction } from '~/models/tiamat'

@Component
export default class MiniMap extends Vue {
  @Prop({})
  room!: Room
  @Prop({})
  gimmicks!: Gimmick[]
  @Prop({})
  clickGimmick!: Function
  @Prop({})
  displayGimmick!: Function
  @Prop({})
  imgOfGim!: Function
  @Prop({})
  colors!: string[]
  @Prop({})
  rgbaColors!: string[]
}
</script>

<style lang="scss" scoped>
.room-image {
  position: relative;
  overflow: hidden;
  pointer-events: none;
}
svg {
  pointer-events: none;
}
.room-name {
  position: relative;
  pointer-events: none;
  margin-bottom: -5px;
  white-space: nowrap;
  z-index: 2;
  color: blue;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  span {
    background: rgba(255, 250, 205, 0.7);
    padding: 1px;
    border-radius: 2px;
  }
}

.gimmick-img {
  border: 1px solid darkred;
  height: 26px;
}
.key-img {
  width: 12px;
  height: 24px;
}
.rotate-r {
  z-index: 1;
  transform: rotate(45deg);
}
.rotate-l {
  z-index: 1;
  transform: rotate(-45deg);
}
.room-box {
  border: 1px solid red;
  box-sizing: border-box;
  overflow: hidden;
  img {
    margin-top: -1px;
    margin-left: -1px;
  }
}
</style>
