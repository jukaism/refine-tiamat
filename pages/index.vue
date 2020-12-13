<template>
  <div class="tiamat-top">
    <div v-if="operator === 'left'" class="d-flex align-start" style="position: fixed; top: 80px; left: 20px; z-index: 3; max-width: 400px; pointer-events: none;">
      <div class="face-image">
        <img src="/icons/fuji-ope.png">
      </div>
      <div class="bal-left" v-html="message"></div>
    </div>
    <div v-if="operator === 'right'" class="d-flex align-start justify-end" style="position: fixed; top: 80px; right: 20px; z-index: 3; max-width: 400px; pointer-events: none;">
      <div class="bal-right" v-html="message"></div>
      <div class="face-image">
        <img src="/icons/plu-ope.png">
      </div>
    </div>
    <div v-if="false" class="d-flex align-start" style="position: fixed; bottom: 10px; left: 10px; z-index: 3;">
      <div style="position: relative;" :style="{ width: currentRoom.width * currentRoomScale + 'px', height: currentRoom.height * currentRoomScale + 'px' }">
        <div class="room-name"><span>{{ currentRoom.name }}</span></div>
        <div>
          <div
            style="position: absolute; left: 0; bottom: 0;"
            :style="{ 'background-color': rgbaColors[currentRoom.floor + 1], width: currentRoom.width + 'px', height: currentRoom.height + 'px', transform: `scale(${currentRoomScale},${currentRoomScale}) translate(${(currentRoomScale - 1) * currentRoom.width / currentRoomScale / 2}px, -${(currentRoomScale - 1) * currentRoom.height / currentRoomScale / 2}px)` }"
            class="room-box-thum"
          >
            <img
              :src="`/maps/${currentRoom.map}.png`"
              class="room-image"
              :style="{ left: `-${currentRoom.x}px`, top: `-${currentRoom.y}px` }"
              style="backface-visibility: hidden"
            >
          </div>
        </div>
        <v-tooltip
          v-for="(gim, gimI) in currentRoom.gimmicks"
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
                style="position: absolute;"
                :style="{ left: `${gim.x * currentRoomScale + (currentRoomScale - 1) * currentRoom.width / currentRoomScale / 2}px`, top: `${gim.y * currentRoomScale - (currentRoomScale - 1) * currentRoom.height / currentRoomScale / 2}px`, display: displayGimmick(gim) }"
                @click="clickGimmick(currentRoom.id, gim)"
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
    <div class="mx-5 px-5 d-flex justify-center align-center">
      <p class="mt-4 mr-2">ナビゲータ</p>
      <div>
        <v-radio-group v-model="operator" row>
          <v-radio label="左" color="secondary" value="left"></v-radio>
          <v-radio label="右" color="secondary" value="right"></v-radio>
          <v-radio label="なし" color="secondary" value="none"></v-radio>
        </v-radio-group>
      </div>
    </div>
    <div style="width: 100%; height: 240px; position: relative; user-select: none;">
      <div
        v-for="(room, roomIndex) in angelViews"
        :key="'room' + roomIndex"
        style="position: absolute;"
        :style="{ left: (room.orix * 70) + 430 + 'px', top: (room.oriy * 70) + 'px' }"
        class="d-flex flex-column"
      >
        <div style="position: relative;">
          <div class="angel-name"><span>{{ room.name }}</span></div>
          <div
            :id="`room${room.id}`"
            :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1] }"
            class="room-box"
          >
            <img
              :src="`/maps/${room.map}.png`"
              class="room-image"
              :style="{ left: 0, top: 0 }"
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
                  :src="gim.key_id ? '/gimmicks/defeated.svg' : '/gimmicks/notdefeated.png'"
                  class="defeated-img"
                  style="position: absolute;"
                  :style="{ left: 0, top: '11px', display: displayGimmick(gim), 'background-color': gim.key_id ? 'rgba(0,0,0,0.3)' : 'clear' }"
                  @click="clickAngel(room.id, gim)"
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
    </div>
    <div class="f-flex flex-column align-center user-select: none;" style="min-height: 150px;">
      <div class="d-flex justify-center align-center">
        <div
          v-for="(team, teamIndex) in teams"
          :key="'teamData' + teamIndex"
        >
          <div
            @click="selectTeam(team.id)"
            :class="{ 'selected-team': currentTeam.id === team.id }"
            class="teams"
            :style="{ 'background-color': teamColors[teamIndex] }"
          >{{ team.name }}</div>
        </div>
      </div>
      <div class="text-center px-5">
        ギミック対応ステータスの設定（INT170はINT150を、VIT130はVIT110を含みません）
        <div class="d-flex justify-center">
          <div
            v-for="(hk, hki) in haveKeys"
            :key="'hk' + hki"
            @click="popKey(hk.id)"
            class="havekey my-1 px-1 mx-3"
          >
            {{ hk.name }}
          </div>
        </div>
        <div class="d-flex justify-center">
          <div
            v-for="(hnk, hnki) in haventKeys"
            :key="'hnk' + hnki"
            @click="forceGetKey(hnk)"
            class="haventkey my-1 px-1 mx-3"
          >
            {{ hnk.name }}
          </div>
        </div>
      </div>
      <div class="text-center px-5">
        {{ currentTeam.name }}の持ち物 : {{ currentTeam.keys.map(key => key.name).join('、') }}
      </div>
      <div class="text-center px-5">
        {{ currentTeam.name }}の移動 : {{ moveOfTeam(currentTeam).map(mv => rooms.find(rm => rm.id === mv.to).name).join(',') }}
      </div>
    </div>
    <div class="d-flex align-center justify-center mt-2">
      <v-btn
        v-if="moves.length > 0"
        @click="revertMove"
        class="mr-3"
        color="primary"
        small
      >
        戻す
      </v-btn>
      <v-btn
        v-else
        color="secondary"
        class="mr-3"
        small
      >
        戻す
      </v-btn>
      注※移動履歴は全チーム共通です
    </div>
    <div style="height: 1500px; width: 1600px; position: relative; z-index: 1;">
      <svg
        id="background"
        :view-box.camel="viewBox" :width="maxx" :height="maxy"
        style="position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;"
      >
      <defs>  
        <linearGradient id="gradient0" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#7A5FFF">
            <animate attributeName="stop-color" values="#7A5FFF; #01FF89; #7A5FFF" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#01FF89">
            <animate attributeName="stop-color" values="#01FF89; #7A5FFF; #01FF89" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
        <linearGradient id="gradient1" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#5fd3ff">
            <animate attributeName="stop-color" values="#5fd3ff; #96ff01; #5fd3ff" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#96ff01">
            <animate attributeName="stop-color" values="#96ff01; #5fd3ff; #96ff01" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
        <linearGradient id="gradient2" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#5fff62">
            <animate attributeName="stop-color" values="#5fff62; #ff5b01; #5fff62" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#ff5b01">
            <animate attributeName="stop-color" values="#ff5b01; #5fff62; #ff5b01" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
        <linearGradient id="gradient3" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#eeff5f">
            <animate attributeName="stop-color" values="#eeff5f; #ff018e; #eeff5f" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#ff018e">
            <animate attributeName="stop-color" values="#ff018e; #eeff5f; #ff018e" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
        <linearGradient id="gradient4" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#ff5f5f">
            <animate attributeName="stop-color" values="#ff5f5f; #6301ff; #ff5f5f" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#6301ff">
            <animate attributeName="stop-color" values="#6301ff; #ff5f5f; #6301ff" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
        <linearGradient id="gradient5" x1="50%" y1="0%" x2="50%" y2="100%" > 
          <stop offset="0%" stop-color="#ff5fe0">
            <animate attributeName="stop-color" values="#ff5fe0; #01b9ff; #ff5fe0" dur="2s" repeatCount="indefinite"></animate>
          </stop>
          <stop offset="100%" stop-color="#01b9ff">
            <animate attributeName="stop-color" values="#01b9ff; #ff5fe0; #01b9ff" dur="2s" repeatCount="indefinite"></animate>
          </stop>
        </linearGradient>
      </defs>
        <line
          v-for="(connection, index) in connections"
          :key="'line' + index"
          stroke-width="2"
          stroke="lightpink"
          :x1="portalX(connection.from)"
          :y1="portalY(connection.from)"
          :x2="portalX(connection.to)"
          :y2="portalY(connection.to)"
        ></line>
        <g
          v-for="(port, portI) in portals"
          :key="'port' + portI"
        >
          <circle v-if="isAvailablePortal(port)" :cx="portalX(port.id)" :cy="portalY(port.id)" r="4" fill="lightgreen">
          </circle>
          <circle v-else :cx="portalX(port.id)" :cy="portalY(port.id)" r="6" fill="red">
          </circle>
          <line
            v-if="!isAvailablePortal(port)"
            stroke-width="2"
            stroke="white"
            :x1="portalX(port.id) - 4"
            :y1="portalY(port.id)"
            :x2="portalX(port.id) + 4"
            :y2="portalY(port.id)"
          >
          </line>
        </g>
        <path
          v-for="(team, teamIndex) in teamPaths"
          :key="'teamPath' + teamIndex"
          :d="team"
          :stroke="`url(#gradient${teamIndex})`"
          stroke-width="2"
          fill="transparent"
        />
        <g
          v-for="(teamRoom, trIndex) in teamRoomIds"
          :key="'teamRoomIds' + trIndex"
          fill="none"
          fill-rule="evenodd"
          stroke-width="1"
          stroke="black"
          stroke-opacity="0.3"
        >
          <circle v-if="teamRoom > 0" :cx="roomCenterX(teamRoom)" :cy="roomCenterY(teamRoom)" r="10" :stroke="teamColors[trIndex]" stroke-width="5">
            <animate attributeName="r" begin="0s" dur="2s" values="0;20" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate>
            <animate attributeName="stroke-opacity" begin="0s" dur="2s" values="0;.6;.6;0" repeatCount="indefinite"></animate>
          </circle>
          <circle v-if="teamRoom > 0" :cx="roomCenterX(teamRoom)" :cy="roomCenterY(teamRoom)" r="5" :stroke="teamColors[trIndex]" stroke-width="5">
            <animate attributeName="r" begin="-1s" dur="2s" values="0;20" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate>
            <animate attributeName="stroke-opacity" begin="-1s" dur="2s" values="0;.6;.6;0" repeatCount="indefinite"></animate>
          </circle>
        </g>
      </svg>
      <div class="d-flex align-start" style="position: absolute; top: 50px; left: 0; user-select: none;">
        <div style="width: 600px; position: relative;">
          <div
            v-for="(room, roomIndex) in north"
            :key="'room' + roomIndex"
            style="position: absolute;"
            :style="{ left: (room.orix * 25 - room.width / 2) + 'px', top: (room.oriy * 40 - room.height / 2) + 'px' }"
            class="d-flex flex-column"
          >
            <div style="position: relative;">
              <div class="room-name"><span>{{ room.name }}</span></div>
              <div
                :id="`room${room.id}`"
                :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                class="room-box"
                @click="moveTeam(room.id)"
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
        </div>
        <div style="width: 400px;">
          <div style="width: 100%; height: 0; position: relative;">
            <div
              v-for="(room, roomIndex) in castleSecond"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: (room.orix * 25 - room.width / 2) + 'px', top: (room.oriy * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
          <div style="width: 100%; height: 0; position: relative;">
            <div
              v-for="(room, roomIndex) in castleThird"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: ((room.orix) * 25 - room.width / 2) + 'px', top: ((room.oriy - 4) * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
          <div style="width: 100%; height: 0; position: relative;">
            <div
              v-for="(room, roomIndex) in castleFirst"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: ((room.orix - 2) * 25 - room.width / 2) + 'px', top: (room.oriy * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
          <div style="width: 100%; height: 0; position: relative;">
            <div
              v-for="(room, roomIndex) in church"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: (room.orix * 25 - room.width / 2) + 'px', top: (room.oriy * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
          <div style="width: 100%; height: 0; margin-top: 500px; position: relative;">
            <div
              v-for="(room, roomIndex) in underground"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: (room.orix * 25 - room.width / 2) + 'px', top: (room.oriy * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
              :class="{ 'rotate-r': room.id === 125 }"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
          <div style="width: 100%; position: relative;">
            <div
              v-for="(room, roomIndex) in entrance"
              :key="'room' + roomIndex"
              style="position: absolute;"
              :style="{ left: (room.orix * 25 - room.width / 2) + 'px', top: (room.oriy * 25 - room.height / 2) + 'px' }"
              class="d-flex flex-column"
            >
              <div style="position: relative;">
                <div class="room-name"><span>{{ room.name }}</span></div>
                <div
                  :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                  @click="moveTeam(room.id)"
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
          </div>
        </div>
        <div style="width: 600px; position: relative;">
          <div
            v-for="(room, roomIndex) in south"
            :key="'room' + roomIndex"
            style="position: absolute;"
              :style="{ left: ((24 - room.orix) * 25 - room.width / 2) + 'px', top: (room.oriy * 40 - room.height / 2) + 'px' }"
            class="d-flex flex-column"
          >
            <div style="position: relative;">
              <div class="room-name"><span>{{ room.name }}</span></div>
              <div
                :id="`room${room.id}`"
                  :style="{ width: room.width + 'px', height: room.height + 'px', 'border-color': colors[room.floor + 1], 'background-color': rgbaColors[room.floor + 1] }"
                  :class="{ 'highlight-room': canMove.find(cm => cm.id === room.id) }"
                  class="room-box"
                @click="moveTeam(room.id)"
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
        </div>
      </div>
      <svg
        :view-box.camel="viewBox" :width="maxx" :height="maxy"
        style="position: absolute; top: 0; left: 0; z-index: 3; pointer-events: none;"
      >
        <g
          v-for="(teamRoom, trIndex) in teamRoomIdAndNames"
          :key="'teamRIN' + trIndex"
          style="position: relative; z-index: 5;"
        >
          <path 
            :fill="teamRoom.color"
            stroke-width="0.5"
            stroke="black"
            :d="roomMarker(teamRoom)"
            style="opacity: 0.7;"
          />
          <text :x="roomCenterX(teamRoom.id) + 30" :y="roomCenterY(teamRoom.id) - 34" font-family="Verdana" font-size="17" fill="rgba(0,0,0,0.7)" style="font-weight: bold;">
            {{ teamRoom.name }}
          </text>
        </g>
      </svg>
    </div>
    <div style="position: fixed; bottom: 20px; left: 20px; z-index: 3; width: 300px; height: 300px;">
      <mini-map
        :room="currentRoom"
        :displayGimmick="displayGimmick"
        :clickGimmick="clickGimmick"
        :imgOfGim="imgOfGim"
        :colors="colors"
        :rgbaColors="rgbaColors"
        :gimmicks="gimmicks"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator"
import { Plan, Room, Team, Move, Key, Portal, Connection, Gimmick, GimmickManager, GimmickRequire, GimmickAction } from '~/models/tiamat'
import MiniMap from '~/components/MiniMap.vue'

@Component({
  name: 'tiamat',
  layout: 'tiamat',
  components: {
    MiniMap
  }
})
export default class Tiamat extends Vue {
  operator: string = 'left'
  allKeys: Key[] = [
    { id: 0, name: 'dummy' },
    { id: 1, name: '北①天文台の鍵' },
    { id: 2, name: '水門①開閉装置作動キー' },
    { id: 3, name: '地下宝物庫の鍵' },
    { id: 4, name: 'カタコンベの鍵' },
    { id: 5, name: '神殿通路1F02の鍵' },
    { id: 6, name: '鐘楼の鍵' },
    { id: 7, name: '釣鐘の部品' },
    { id: 8, name: '財の間の鍵' },
    { id: 9, name: 'エントランスの鍵' },
    { id: 10, name: '赤の宝石' },
    { id: 11, name: '緑の宝石' },
    { id: 12, name: '黒の宝石' },
    { id: 13, name: '貴賓室の鍵' },
    { id: 14, name: '大貴賓室の鍵' },
    { id: 16, name: '小礼拝堂の鍵' },
    { id: 17, name: '城内通路2F03の鍵' },
    { id: 18, name: '塔・東3Fの鍵' },
    { id: 19, name: '塔・北東3Fの鍵' },
    { id: 20, name: '塔・北東2Fの鍵' },
    { id: 21, name: '水門②開閉装置作動キー' },
    { id: 22, name: '拷問部屋の鍵' },
    { id: 23, name: '兵舎1F 武器庫の鍵' },
    { id: 24, name: '兵舎2F 武器庫の鍵' },
    { id: 25, name: '城壁2F06の鍵' },
    { id: 26, name: 'ペコ舎の鍵' },
    { id: 27, name: '王家の花の種' },
    { id: 28, name: '王家の花' },
    { id: 29, name: '所持重量2000以下' },
    { id: 30, name: 'STR170以上' },
    { id: 31, name: 'VIT110以上' },
    { id: 32, name: 'VIT130以上' },
    { id: 33, name: 'DEX220以上' },
    { id: 34, name: 'INT150以上' },
    { id: 35, name: 'INT170以上' },
    { id: 36, name: '裏庭の鍵' },
    { id: 37, name: 'LUK100以上' },
    { id: 38, name: 'たくさんの石' },
    { id: 39, name: '使用人居住区の鍵' }
  ]
  statusKeys: Key[] = [
    { id: 29, name: '所持重量2000以下' },
    { id: 30, name: 'STR170以上' },
    { id: 31, name: 'VIT110以上' },
    { id: 32, name: 'VIT130以上' },
    { id: 33, name: 'DEX220以上' },
    { id: 34, name: 'INT150以上' },
    { id: 35, name: 'INT170以上' },
    { id: 37, name: 'LUK100以上' }
  ]
  get haveKeys(): Key[] {
    return this.statusKeys.filter(stk => !!this.currentTeam.keys.find(k => k.id === stk.id))
  }
  get haventKeys(): Key[] {
    return this.statusKeys.filter(stk => !this.haveKeys.find(k => k.id === stk.id))
  }
  selectTeam(tid: number) {
    this.selectedTeam = tid
  }
  get lastAction(): string | null {
    const la: any = this.currentTeam.move[this.currentTeam.move.length - 1]
    if (!!la.keyGain) {
      return la.keyGain.name + 'を手に入れた。'
    } else if (!!la.actions) {
      return la.actions.map((act: GimmickAction) => act.desc).join('<br/>')
    } else {
      return null
    }
  }
  get message(): string {
    if (this.lastAction) {
      return this.lastAction
    }
    const can = this.canMove.map(room => `<b>${room.name}</b>`).join('、') + 'へ移動できる。'
    const cant = this.cantMove.length > 0
     ? this.cantMove.map(room => `${room.portal.desc}`).join('<br/>')
     : ''
    if (this.canMove.length > 0) {
      return can + '<br/>' + cant
    } else {
      return cant
    }
  }
  colors: string[] = [
    '#ff6969',
    '#5f99ff',
    '#fee122',
    '#4fe3c2',
    '#f5a623',
    '#48d535',
    // '#647CA2',
    // '#5f99ff',
    // '#9699A2',
    // '#AACB9B',
    // '#9BCBC4',
    // '#FFF1BD',
    // '#F6C2B7',
    '#ff8535',
    '#000000'
  ]
  rgbaColors: string[] = [
    'rgba(255, 105, 105, 0.2)',
    'rgba(95, 153, 255, 0.2)',
    'rgba(254, 225, 34, 0.2)',
    'rgba(79, 227, 194, 0.2)',
    'rgba(245, 166, 35, 0.2)',
    'rgba(72, 215, 53, 0.2)',
    // 'rgba(100, 124, 162, 0.2)',
    // 'rgba(95, 153, 255, 0.2)',
    // 'rgba(150, 153, 162, 0.2)',
    // 'rgba(170, 203, 155, 0.2)',
    // 'rgba(155, 203, 196, 0.2)',
    // 'rgba(255, 241, 189, 0.2)',
    // 'rgba(246, 194, 183, 0.2)',
    'rgba(255, 133, 53, 0.2)'
  ]
  teamColors: string [] = [
    '#41ffa9', '#b6ff41', '#ff7b41', '#ff41ae', '#8341ff', '#41d9ff'
  ]
  bgElement: HTMLElement | null = null
  roomElements: {
    id: string,
    element: HTMLElement,
  }[] = []
  private mounted() {
    this.decorateRelation()
  }
  decorateRelation() {
    this.$nextTick(function() {
      this.bgElement = document.getElementById('background')
      const bgTop = this.bgElement ? this.bgElement.getBoundingClientRect().top : 0
      this.roomElements = []
      this.rooms.forEach((room: Room) => {
        const element = document.getElementById(`room${room.id}`)
        if (element) {
          this.roomElements.push({
            id: `room${room.id}`,
            element: element
          })
        }
      })
    })
  }
  get roomRects(): ClientRect[] | DOMRect[] {
    return this.roomElements.map((element: { id: string, element: HTMLElement }) => { return element.element.getBoundingClientRect() })
  }
  get bgLeft(): number {
    return (this.bgElement?.getBoundingClientRect().left || 0)
  }
  get bgTop(): number {
    return (this.bgElement?.getBoundingClientRect().top || 0)
  }
  get entrance(): Room[] {
    return this.rooms.filter(room => room.zone === 0)
  }
  get north(): Room[] {
    return this.rooms.filter(room => room.zone === 1)
  }
  get south(): Room[] {
    return this.rooms.filter(room => room.zone === 2)
  }
  get church(): Room[] {
    return this.rooms.filter(room => room.zone === 4)
  }
  get underground(): Room[] {
    return this.rooms.filter(room => room.zone === 5)
  }
  get castleThird(): Room[] {
    return this.rooms.filter(room => room.zone === 6)
  }
  get castleSecond(): Room[] {
    return this.rooms.filter(room => room.zone === 7)
  }
  get castleFirst(): Room[] {
    return this.rooms.filter(room => room.zone === 8)
  }
  get angelViews(): Room[] {
    return this.rooms.filter(room => room.zone === 9)
  }
  roomCenterX(id: number): number {
    const rect = this.roomRects[id - 1]
    if (rect) {
      return (rect.left + rect.right) / 2 - this.bgLeft
    } else {
      return 0
    }
  }
  roomCenterY(id: number): number {
    const rect = this.roomRects[id - 1]
    if (rect) {
      return (rect.top + rect.bottom) / 2 - this.bgTop
    } else {
      return 0
    }
  }
  roomLeft(id: number): number {
    const rect = this.roomRects[id - 1]
    if (rect) {
      return rect.left - this.bgLeft
    } else {
      return 0
    }
  }
  roomTop(id: number): number {
    const rect = this.roomRects[id - 1]
    if (rect) {
      return rect.top - this.bgTop
    } else {
      return 0
    }
  }
  portalX(id: number): number {
    const portal = this.portals.find(portal => portal.id === id)
    if (portal) {
      return portal.x + this.roomLeft(portal.room_id)
    } else {
      return 0
    }
  }
  portalY(id: number): number {
    const portal = this.portals.find(portal => portal.id === id)
    if (portal) {
      return portal.y + this.roomTop(portal.room_id)
    } else {
      return 0
    }
  }
  get teamPaths(): string[] {
    const paths = this.teams.map(tm => this.moveOfTeam(tm).map((mv: Move, index: number): string => {
      const x = this.roomCenterX(mv.to)
      const y = this.roomCenterY(mv.to)
      if (index === 0) {
        const fx = this.roomCenterX(mv.from)
        const fy = this.roomCenterY(mv.from)
        const one = `${fx} ${fy} `
        const two = `L ${fx - 8.82} ${fy + 27.14} `
        const three = `L ${fx + 14.27} ${fy + 10.36} `
        const four = `L ${fx - 14.27} ${fy + 10.36} `
        const five = `L ${fx + 8.82} ${fy + 27.14} `
        return `M ${one + two + three + four + five + 'L ' + one}L ${x} ${y}`
      } else {
        return `L ${x} ${y}`
      }
    }).join(' '))
    return paths
  }
  roomMarker({ id, name }: { id: number, name: string }): string {
    const x = this.roomCenterX(id)
    const y = this.roomCenterY(id)
    return `M ${x} ${y} L ${x + 25} ${y - 50} H ${x + name.length * 9 + 50} L ${x + name.length * 9 + 40} ${y - 30} H ${x + 15} Z`
  }
  maxx = 1600
  maxy = 1500
  get viewBox(): string {
    return `0 0 ${this.maxx} ${this.maxy}`
  }
  plan: Plan = {
    uuid: 'dummy',
    memo: 'memo',
    teams: []
  }
  teams: Team[] = [
    {
      id: 0,
      name: 'Team A',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
    {
      id: 1,
      name: 'Team B',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
    {
      id: 2,
      name: 'Team C',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
    {
      id: 3,
      name: 'Team D',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
    {
      id: 4,
      name: 'Team E',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
    {
      id: 5,
      name: 'Team F',
      move: [ { from: 1, to: 1 } ],
      keys: []
    },
  ]
  selectedTeam: number = 0
  get currentTeam(): Team {
    return this.teams[this.selectedTeam]
  }
  moveOfTeam(team: Team): Move[] {
    const moves: any[] = team.move.filter(mv => {
      const mvonly: any = mv
      return !!mvonly.to
    })
    return moves
  }
  get teamRoomIds(): number[] {
    const ids = this.teams.map(team => {
      const moves: Move[] = this.moveOfTeam(team)
      return moves[moves.length - 1].to
    })
    return ids.map((id, index) => (index === 0 || !ids.slice(0, index).find(i => i === id)) ? id : 0)
  }
  get teamRoomIdAndNames(): { id: number, name: string, color: string }[] {
    let iAndNs: { id: number, name: string, color: string }[] = []
    this.teams.forEach((team, index) => {
      const moves: Move[] = this.moveOfTeam(team)
      const room_id: number = moves[moves.length - 1].to
      const target = iAndNs.find(iAndN => iAndN.id === room_id)
      if (target) {
        iAndNs.splice(iAndNs.indexOf(target), 1, { id: room_id, name: target.name + `,${team.name.substr(-1)}`, color: target.color })
      } else {
        iAndNs.push({ id: room_id, name: team.name.substr(-1), color: this.teamColors[index] })
      }
    })
    return iAndNs
  }
  get currentRoom(): Room {
    const moves: Move[] = this.moveOfTeam(this.currentTeam)
    const lastMoveTo = moves[moves.length - 1].to
    return this.rooms.find(room => room.id === lastMoveTo)!
  }
  get currentRoomScale(): number {
    return Math.floor(Math.min(200 / this.currentRoom.width, 200 / this.currentRoom.height))
  }
  get nearPortals(): Portal[] {
    return this.portals.filter(portal => portal.room_id === this.currentRoom.id)
  }
  get availablePortals(): Portal[] {
    return this.nearPortals.filter(portal => this.isAvailablePortal(portal))
  }
  get lockedPortals(): Portal[] {
    return this.nearPortals.filter(portal => !this.isAvailablePortal(portal))
  }
  isAvailablePortal(portal: Portal): boolean {
    const gim = this.gimmicks.find(gimmick => gimmick.id === portal.require)
    const gimClear = !gim || (!!gim && gim.status === portal.requireStatus)
    const keyClear = !portal.sk || (!!portal.sk && this.hasKey(portal.sk))
    if (!!portal.sk) {
      if (portal.require) {
        return gimClear || keyClear
      } else {
        return keyClear
      }
    } else {
      return gimClear
    }
  }
  portalToRoom(portal: Portal): Room {
    const from = this.connections.find(connection => connection.from === portal.id)
    if (from) {
      return this.rooms.find(room => room.id === this.portals.find(por => por.id === from.to)!.room_id)!
    } else {
      const to = this.connections.find(connection => connection.to === portal.id)!
      return this.rooms.find(room => room.id === this.portals.find(por => por.id === to.from)!.room_id)!
    }
  } 
  get canMove(): Room[] {
    return this.availablePortals.map(portal => this.portalToRoom(portal))
  }
  get cantMove(): { room: Room, portal: Portal }[] {
    return this.lockedPortals.map(portal => { return { room: this.portalToRoom(portal), portal: portal } } )
  }
  moveTeam(room_id: number) {
    if (this.canMove.find(room => room.id === room_id)) {
      this.currentTeam.move.push(
        {
          from: room_id - 1,
          to: room_id
        }
      )
      this.moves.push(this.selectedTeam)
    }
  }
  displayGimmick(gim: GimmickManager): string {
    if (this.isSatisfied(gim.require)) {
      return 'block'
    } else {
      return 'none'
    }
  }
  isSatisfied(reqs: GimmickRequire[]): boolean {
    return !reqs.find(req => this.gimmicks[req.gimmick_id].status !== req.status)
  }
  imgOfGim(gim: GimmickManager): string {
    if (gim.keyGain) {
      return '/gimmicks/key.svg'
    } else if (gim.key_id) {
      return this.hasKey(gim.key_id) ? '/gimmicks/has.svg' : '/gimmicks/nohas.svg'
    } else if (this.haveIcon.find(ic => ic === gim.gimmick_id)) {
      return `/gimmicks/gim${gim.gimmick_id}.png`
    } else {
      return '/gimmicks/gear.svg'
    }
  }
  get haveIcon(): number[] {
    return [1,2,3,4,5,6,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,64,78,99]
  }
  clickGimmick(room_id: number, gim: GimmickManager) {
    if (this.currentRoom.id === room_id) {
      if (!gim.key_id || this.hasKey(gim.key_id)) {
        if (gim.actions.length > 0) {
          gim.actions.forEach(act => { this.gimmicks[act.gimmick_id].status += act.add })
          this.currentTeam.move.push(gim)
          this.moves.push(this.selectedTeam)
          // WORKAROUND: 釣鐘、宝石は消耗品
          if ([7, 10, 11, 12].find(kid => kid === gim.key_id)) {
            this.popKey(gim.key_id!)
          }
        }
        if (gim.keyGain) {
          if ([10, 11, 12].find(kid => kid === gim.keyGain?.id) && this.hasGem()){
            return
          } else {
            this.getKey(room_id, gim.keyGain)
            this.currentTeam.move.push(gim)
            this.moves.push(this.selectedTeam)
          }
        }
      }
    } else if (this.canMove.find(rm => rm.id === room_id)) {
      this.moveTeam(room_id)
    }
  }
  moves: number[] = []
  revertMove() {
    if (this.moves.length > 0) {
      this.selectedTeam = this.moves[this.moves.length - 1]
      const lastMove: any = this.currentTeam.move[this.currentTeam.move.length - 1]
      if (lastMove.gimmick_id) {
        const gim: GimmickManager = lastMove
        if (gim.actions.length > 0) {
          gim.actions.forEach(act => { this.gimmicks[act.gimmick_id].status -= act.add })
          if ([7, 10, 11, 12].find(kid => kid === gim.key_id)) {
            this.forceGetKey(this.allKeys[gim.key_id!])
          }
        }
        if (gim.keyGain) {
          this.popKey(gim.keyGain.id)
        }
      }
      this.currentTeam.move.splice(this.currentTeam.move.length - 1, 1)
      this.moves.splice(this.moves.length - 1, 1)
    }
  }
  clickAngel(room_id: number, gim: GimmickManager) {
    gim.actions.forEach(act => { this.gimmicks[act.gimmick_id].status += act.add })
  }
  hasKey(key_id: number): boolean {
    return !!this.currentTeam.keys.find(k => k.id === key_id)
  }
  hasGem(): boolean {
    return !!this.currentTeam.keys.find(k => { return 10 <= k.id && k.id <= 12 })
  }
  getKey(room_id: number, key: Key) {
    if (this.currentRoom.id === room_id && !this.currentTeam.keys.find(k => k.id === key.id)) { this.currentTeam.keys.push(key) }
  }
  forceGetKey(key: Key) {
    this.currentTeam.keys.push(key)
  }
  popKey(key_id: number) {
    const target = this.currentTeam.keys.find(k => k.id === key_id)
    if (target) { 
      const index = this.currentTeam.keys.indexOf(target)
      this.currentTeam.keys.splice(index, 1)
    }
  }
  rooms: Room[] = [
    {
      id: 1,
      zone: 0,
      floor: 1,
      orix: 8,
      oriy: 30,
      name: '橋',
      map: 'sch_gld',
      x: 258, y: 135,
      width: 60, height: 140,
      gimmicks: []
    },
    {
      id: 2,
      zone: 0,
      floor: 1,
      orix: 8,
      oriy: 26,
      name: '城門①1F',
      map: 'yuno_in02',
      x: 69, y: 146,
      width: 50, height: 50,
      gimmicks: [
        { gimmick_id: 46, x: 12, y: 20, actions: [{ gimmick_id: 46, add: 1, desc: '<b>愚者の化身ルキフグス</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 46, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 3,
      zone: 0,
      floor: 1,
      orix: 7.5,
      oriy: 16.5,
      name: '中庭（中央）',
      map: 'que_qsch01',
      x: 100, y: 230,
      width: 72, height: 72,
      gimmicks: []
    },
    {
      id: 4,
      zone: 0,
      floor: 1,
      orix: -2,
      oriy: 16,
      name: '中庭（西）',
      map: 'aru_gld',
      x: 0, y: 0,
      width: 70, height: 70,
      gimmicks: []
    },
    {
      id: 5,
      zone: 0,
      floor: 1,
      orix: -1.3,
      oriy: 13.8,
      name: '畜舎',
      map: 'payon_in02',
      x: 46, y: 59,
      width: 18, height: 13,
      gimmicks: []
    },
    // 西ルート
    {
      id: 6,
      zone: 1,
      floor: 1,
      orix: 20,
      oriy: 8.1,
      name: '北①1F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 7,
      zone: 1,
      floor: 2,
      orix: 20,
      oriy: 6.4,
      name: '北①2F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 8,
      zone: 1,
      floor: 3,
      orix: 20,
      oriy: 4.7,
      name: '北①3F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 5, x: 40, y: 15, actions: [{ gimmick_id: 5, add: 1, desc: 'カデス像のアルカナを確認した。' }], keyGain: null, require: [ { gimmick_id: 1, status: 1 }, { gimmick_id: 5, status: 0 } ], key_id: null },
        // { gimmick_id: 5, x: 40, y: 15, actions: [], keyGain: null, require: [ { gimmick_id: 5, status: 1 } ], key_id: 0 }
      ]
    },
    {
      id: 9,
      zone: 1,
      floor: 4,
      orix: 20,
      oriy: 3,
      name: '北①4F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 9, x: 13, y: 5, actions: [{ gimmick_id: 9, add: 1, desc: '北①天文台の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 9, status: 0 } ], key_id: 1 }
      ]
    },
    {
      id: 10,
      zone: 1,
      floor: 5,
      orix: 20,
      oriy: 1,
      name: '北①天文台',
      map: '1@eom',
      x: 82, y: 100,
      width: 30, height: 30,
      gimmicks: [
        { gimmick_id: 10, x: -19, y: 15, actions: [{ gimmick_id: 10, add: 1, desc: '水門①を起動し、操作が可能になった。' }], keyGain: null, require: [ { gimmick_id: 10, status: 0 } ], key_id: 2 },
        { gimmick_id: 11, x: -19, y: 15, actions: [
          { gimmick_id: 11, add: 1, desc: '水門①を開けた。' },
          { gimmick_id: 13, add: 1, desc: '水路01、水路02、噴水最深部へは入れなくなった。（注※井戸底へ流されるギミックは再現していません）<br/>浮き橋を渡って祈りの間へ行ける。'}
        ], keyGain: null, require: [
          { gimmick_id: 10, status: 1 },
          { gimmick_id: 11, status: 0 },
          { gimmick_id: 13, status: 0 }
        ], key_id: null },
        { gimmick_id: 11, x: -19, y: 15, actions: [
          { gimmick_id: 11, add: 1, desc: '水門①を開けた。' },
          { gimmick_id: 13, add: 1, desc: '両方の水門が開かれ、水路へは入れなくなった。（注※井戸底へ流されるギミックは再現していません）<br/>王家の種をプランターで花にできる。' },
          { gimmick_id: 97, add: 1, desc: '浮き橋を渡れなくなった。' }
        ], keyGain: null, require: [
          { gimmick_id: 10, status: 1 },
          { gimmick_id: 11, status: 0 },
          { gimmick_id: 13, status: 1 }
        ], key_id: null },
        { gimmick_id: 11, x: -19, y: 15, actions: [
          { gimmick_id: 11, add: -1, desc: '水門①を閉じた。' },
          { gimmick_id: 13, add: -1, desc: '両方の水門が閉じ、水路を自由に移動できる。（注※井戸底へ流されるギミックは再現していません）<br/>浮き橋を渡れなくなった。' },
        ], keyGain: null, require: [
          { gimmick_id: 10, status: 1 },
          { gimmick_id: 11, status: 1 },
          { gimmick_id: 13, status: 1 }
        ], key_id: null },
        { gimmick_id: 11, x: -19, y: 15, actions: [
          { gimmick_id: 11, add: -1, desc: '水門①を閉じた。' },
          { gimmick_id: 97, add: -1, desc: '水路03へ入れるようになった。（注※井戸底へ流されるギミックは再現していません）' },
          { gimmick_id: 13, add: -1, desc: '浮き橋を渡って祈りの間へ行ける。' }
        ], keyGain: null, require: [
          { gimmick_id: 10, status: 1 },
          { gimmick_id: 11, status: 1 },
          { gimmick_id: 13, status: 2 }
        ], key_id: null }
      ]
    },
    {
      id: 11,
      zone: 1,
      floor: 1,
      orix: 12,
      oriy: 10,
      name: '北西1F',
      map: 'bra_in01',
      x: 80, y: 120,
      width: 30, height: 25,
      gimmicks: [
        { gimmick_id: 14, x: 18, y: 8, actions: [], keyGain: { id: 3, name: '地下宝物庫の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 12,
      zone: 1,
      floor: 2,
      orix: 12,
      oriy: 8.2,
      name: '北西2F',
      map: '1@gl_k',
      x: 262, y: 146,
      width: 36, height: 42,
      gimmicks: [
        { gimmick_id: 15, x: 3, y: 20, actions: [{ gimmick_id: 15, add: 1, desc: '「城壁2F01～03」の全てのトラップが解除された。' }], keyGain: null, require: [{ gimmick_id: 15, status: 0 }], key_id: null }
      ]
    },
    {
      id: 13,
      zone: 1,
      floor: 3,
      orix: 12,
      oriy: 6.4,
      name: '北西3F',
      map: 'prt_are_in',
      x: 9, y: 0,
      width: 26, height: 26,
      gimmicks: [
        { gimmick_id: 4, x: 5, y: -15, actions: [{ gimmick_id: 4, add: 1, desc: 'ジオイア像のアルカナを確認した。' }], keyGain: null, require: [ { gimmick_id: 1, status: 1 }, { gimmick_id: 4, status: 0 } ], key_id: null },
        // { gimmick_id: 4, x: 5, y: -5, actions: [], keyGain: null, require: [ { gimmick_id: 4, status: 1 } ], key_id: 0 }
      ]
    },
    {
      id: 14,
      zone: 1,
      floor: 4,
      orix: 12,
      oriy: 4.6,
      name: '北西屋上',
      map: 'glast_01',
      x: 97, y: 37,
      width: 30, height: 50,
      gimmicks: []
    },
    {
      id: 15,
      zone: 1,
      floor: 1,
      orix: 4,
      oriy: 16.5,
      name: '西1F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 16,
      zone: 1,
      floor: 2,
      orix: 4,
      oriy: 14.5,
      name: '西2F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 17,
      zone: 1,
      floor: 3,
      orix: 4,
      oriy: 12.5,
      name: '西3F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 18,
      zone: 1,
      floor: 4,
      orix: 4,
      oriy: 10.5,
      name: '西屋上',
      map: 'thana_boss',
      x: 120, y: 42,
      width: 40, height: 35,
      gimmicks: [
        { gimmick_id: 9, x: 26, y: 18, actions: [], keyGain: { id: 1, name: '北①天文台の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 19,
      zone: 1,
      floor: 1,
      orix: 12,
      oriy: 28,
      name: '南西1F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 20,
      zone: 1,
      floor: 2,
      orix: 12,
      oriy: 26,
      name: '南西2F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 21,
      zone: 1,
      floor: 3,
      orix: 12,
      oriy: 24,
      name: '南西3F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 3, x: 0, y: 35, actions: [{ gimmick_id: 3, add: 1, desc: 'ヒュリエル像のアルカナを確認した。' }], keyGain: null, require: [ { gimmick_id: 1, status: 1 }, { gimmick_id: 3, status: 0 } ], key_id: null },
        // { gimmick_id: 3, x: 0, y: 35, actions: [], keyGain: null, require: [ { gimmick_id: 3, status: 1 } ], key_id: 0 }
      ]
    },
    {
      id: 22,
      zone: 1,
      floor: 4,
      orix: 12,
      oriy: 22,
      name: '南西屋上',
      map: 'thana_boss',
      x: 45, y: 90,
      width: 35, height: 35,
      gimmicks: []
    },
    {
      id: 23,
      zone: 1,
      floor: 1,
      orix: 22,
      oriy: 30.5,
      name: '南①1F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 7, x: 50, y: 50, actions: [{ gimmick_id: 7, add: 1, desc: '南①1Fのレバーを操作した。' }], keyGain: null, require: [{ gimmick_id: 7, status: 0 }], key_id: null }
      ]
    },
    {
      id: 24,
      zone: 1,
      floor: 2,
      orix: 22,
      oriy: 28.5,
      name: '南①2F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 25,
      zone: 1,
      floor: 3,
      orix: 22,
      oriy: 26.5,
      name: '南①3F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 2, x: 40, y: 15, actions: [{ gimmick_id: 2, add: 1, desc: 'デヒョン像のアルカナを確認した。' }], keyGain: null, require: [ { gimmick_id: 1, status: 1 }, { gimmick_id: 2, status: 0 } ], key_id: null },
        // { gimmick_id: 2, x: 40, y: 15, actions: [], keyGain: null, require: [ { gimmick_id: 2, status: 1 } ], key_id: 0 }
      ]
    },
    {
      id: 26,
      zone: 1,
      floor: 4,
      orix: 22,
      oriy: 24.5,
      name: '南①屋上',
      map: 'thana_boss',
      x: 60, y: 170,
      width: 50, height: 50,
      gimmicks: []
    },
    {
      id: 27,
      zone: 1,
      floor: 2,
      orix: 16,
      oriy: 7.5,
      name: '城壁2F04',
      map: 'abbey03',
      x: 109, y: 142,
      width: 22, height: 52,
      gimmicks: [
        { gimmick_id: 10, x: -7, y: 30, actions: [], keyGain: { id: 2, name: '水門①開閉装置作動キー' }, require: [], key_id: 0 }
      ],
    },
    {
      id: 28,
      zone: 1,
      floor: 3,
      orix: 16,
      oriy: 5.5,
      name: '城壁通路07',
      map: 'prt_gld',
      x: 76, y: 59,
      width: 45, height: 16,
      gimmicks: []
    },
    {
      id: 29,
      zone: 1,
      floor: 2,
      orix: 8,
      oriy: 11,
      name: '城壁2F03',
      map: '1@tnm1',
      x: 85, y: 107,
      width: 80, height: 18,
      gimmicks: [
        { gimmick_id: 43, x: 10, y: 15, actions: [{ gimmick_id: 43, add: 1, desc: '<b>太陽の化身アイニ</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 43, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 30,
      zone: 1,
      floor: 3,
      orix: 8,
      oriy: 9,
      name: '城壁通路05',
      map: 'prt_gld',
      x: 52, y: 80,
      width: 20, height: 46,
      gimmicks: []
    },
    {
      id: 31,
      zone: 1,
      floor: 2,
      orix: 7,
      oriy: 22,
      name: '城壁2F02',
      map: 'abbey03',
      x: 209, y: 145,
      width: 31, height: 51,
      gimmicks: []
    },
    {
      id: 32,
      zone: 1,
      floor: 3,
      orix: 7,
      oriy: 19,
      name: '城壁通路03',
      map: 'prt_gld',
      x: 52, y: 182,
      width: 21, height: 70,
      gimmicks: []
    },
    {
      id: 33,
      zone: 1,
      floor: 2,
      orix: 17,
      oriy: 28,
      name: '城壁2F01',
      map: 'abbey03',
      x: 77, y: 190,
      width: 103, height: 46,
      gimmicks: []
    },
    {
      id: 34,
      zone: 1,
      floor: 3,
      orix: 17,
      oriy: 26,
      name: '城壁通路01',
      map: 'prt_gld',
      x: 68, y: 247,
      width: 26, height: 22,
      gimmicks: []
    },
    {
      id: 35,
      zone: 1,
      floor: 3,
      orix: 30,
      oriy: 27.5,
      name: '城門①3F',
      map: 'prt_are_in',
      x: 83, y: 165,
      width: 30, height: 30,
      gimmicks: [
        { gimmick_id: 1, x: -23, y: -15, actions: [{ gimmick_id: 1, add: 1, desc: 'グローザ像を起動した。四怨将像のアルカナを確認しよう。' }], keyGain: null, require: [{ gimmick_id: 1, status: 0 }], key_id: null },
        { gimmick_id: 6, x: -23, y: -15, actions: [{ gimmick_id: 6, add: 1, desc: 'グローザ像にアルカナを示し、北西2Fへの道が開かれた。' }, { gimmick_id: 8, add: 1, desc: '「城壁通路01」「城壁通路03」の扉が閉じられた。' }], keyGain: null, require: [{ gimmick_id: 2, status: 1 }, { gimmick_id: 3, status: 1 }, { gimmick_id: 4, status: 1 }, { gimmick_id: 5, status: 1 }, { gimmick_id: 6, status: 0 }], key_id: null }
      ]
    },
    {
      id: 36,
      zone: 1,
      floor: 4,
      orix: 30,
      oriy: 25,
      name: '城門①屋上',
      map: 'thana_boss',
      x: 98, y: 103,
      width: 75, height: 75,
      gimmicks: []
    },
    // 東ルート
    {
      id: 37,
      zone: 2,
      floor: -1,
      orix: 21.3,
      oriy: 10.5,
      name: '北②B1F',
      map: 'lhz_dun02',
      x: 250, y: 0,
      width: 35, height: 43,
      gimmicks: [
        { gimmick_id: 57, x: 20, y: 20, actions: [{ gimmick_id: 57, add: 1, desc: '水門②を起動し、操作が可能になった。' }], keyGain: null, require: [ { gimmick_id: 57, status: 0 } ], key_id: 21 },
        { gimmick_id: 12, x: 20, y: 20, actions: [
          { gimmick_id: 12, add: 1, desc: '水門②を開けた。' },
          { gimmick_id: 13, add: 1, desc: '水路01、水路02、噴水最深部へは入れなくなった。（注※井戸底へ流されるギミックは再現していません）<br/>浮き橋を渡って祈りの間へ行ける。'}
        ], keyGain: null, require: [
          { gimmick_id: 57, status: 1 },
          { gimmick_id: 12, status: 0 },
          { gimmick_id: 13, status: 0 }
        ], key_id: null },
        { gimmick_id: 12, x: 20, y: 20, actions: [
          { gimmick_id: 12, add: 1, desc: '水門②を開けた。' },
          { gimmick_id: 13, add: 1, desc: '両方の水門が開かれ、水路へは入れなくなった。（注※井戸底へ流されるギミックは再現していません）<br/>王家の種をプランターで花にできる。' },
          { gimmick_id: 97, add: 1, desc: '浮き橋を渡れなくなった。' }
        ], keyGain: null, require: [
          { gimmick_id: 57, status: 1 },
          { gimmick_id: 12, status: 0 },
          { gimmick_id: 13, status: 1 }
        ], key_id: null },
        { gimmick_id: 12, x: 20, y: 20, actions: [
          { gimmick_id: 12, add: -1, desc: '水門②を閉じた。' },
          { gimmick_id: 13, add: -1, desc: '両方の水門が閉じ、水路を自由に移動できる。（注※井戸底へ流されるギミックは再現していません）<br/>浮き橋を渡れなくなった。' },
        ], keyGain: null, require: [
          { gimmick_id: 57, status: 1 },
          { gimmick_id: 12, status: 1 },
          { gimmick_id: 13, status: 1 }
        ], key_id: null },
        { gimmick_id: 12, x: 20, y: 20, actions: [
          { gimmick_id: 12, add: -1, desc: '水門②を閉じた。' },
          { gimmick_id: 13, add: -1, desc: '水路03へ入れるようになった。（注※井戸底へ流されるギミックは再現していません）' },
          { gimmick_id: 97, add: -1, desc: '浮き橋を渡って祈りの間へ行ける。' }
        ], keyGain: null, require: [
          { gimmick_id: 57, status: 1 },
          { gimmick_id: 12, status: 1 },
          { gimmick_id: 13, status: 2 }
        ], key_id: null }
      ]
    },
    {
      id: 38,
      zone: 2,
      floor: 1,
      orix: 20,
      oriy: 8.3,
      name: '北②1F',
      map: 'gef_tower',
      x: 145, y: 21,
      width: 26, height: 38,
      gimmicks: []
    },
    {
      id: 39,
      zone: 2,
      floor: 2,
      orix: 20,
      oriy: 6.6,
      name: '北②2F',
      map: 'gef_tower',
      x: 31, y: 89,
      width: 42, height: 42,
      gimmicks: []
    },
    {
      id: 40,
      zone: 2,
      floor: 3,
      orix: 20,
      oriy: 4.9,
      name: '北②3F',
      map: 'gef_tower',
      x: 93, y: 67,
      width: 38, height: 38,
      gimmicks: []
    },
    {
      id: 41,
      zone: 2,
      floor: 4,
      orix: 20,
      oriy: 3.1,
      name: '北②屋上',
      map: 'glast_01',
      x: 274, y: 37,
      width: 30, height: 50,
      gimmicks: [
        { gimmick_id: 57, x: 25, y: 13, actions: [], keyGain: { id: 21, name: '水門②開閉装置作動キー' }, require: [], key_id: 0 }
      ],
    },
    {
      id: 42,
      zone: 2,
      floor: -1,
      orix: 15,
      oriy: 12.5,
      name: '北東B1F',
      map: 'gl_prison1',
      x: 20, y: 22,
      width: 52, height: 50,
      gimmicks: []
    },
    {
      id: 43,
      zone: 2,
      floor: 1,
      orix: 12,
      oriy: 10,
      name: '北東1F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 44,
      zone: 2,
      floor: 2,
      orix: 12,
      oriy: 8.2,
      name: '北東2F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 56, x: 5, y: 45, actions: [{ gimmick_id: 56, add: 1, desc: '北東2Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 56, status: 0 } ], key_id: 20 }
      ]
    },
    {
      id: 45,
      zone: 2,
      floor: 3,
      orix: 12,
      oriy: 6.4,
      name: '北東3F',
      map: '1@tower',
      x: 0, y: 0,
      width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 55, x: 5, y: 45, actions: [{ gimmick_id: 55, add: 1, desc: '北東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 55, status: 0 } ], key_id: 19 }
      ]
    },
    {
      id: 46,
      zone: 2,
      floor: 4,
      orix: 12,
      oriy: 4.8,
      name: '北東屋上',
      map: 'thana_boss',
      x: 205, y: 97,
      width: 26, height: 30,
      gimmicks: [
        { gimmick_id: 56, x: -7, y: 20, actions: [], keyGain: { id: 20, name: '塔・北東2Fの鍵' }, require: [], key_id: 0 }
      ],
    },
    {
      id: 47,
      zone: 2,
      floor: 1,
      orix: 4,
      oriy: 16.5,
      name: '東1F',
      map: 'bra_in01',
      x: 7, y: 165,
      width: 52, height: 32,
      gimmicks: []
    },
    {
      id: 48,
      zone: 2,
      floor: 2,
      orix: 4,
      oriy: 14.5,
      name: '東2F',
      map: 'bra_in01',
      x: 3, y: 119,
      width: 56, height: 24,
      gimmicks: []
    },
    {
      id: 49,
      zone: 2,
      floor: 3,
      orix: 4,
      oriy: 12.5,
      name: '東3F',
      map: 'prt_are_in',
      x: 9, y: 0,
      width: 26, height: 26,
      gimmicks: [
        { gimmick_id: 54, x: -24, y: 15, actions: [{ gimmick_id: 54, add: 1, desc: '東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 54, status: 0 } ], key_id: 18 },
        { gimmick_id: 96, x: 30, y: 15, actions: [{ gimmick_id: 96, add: 1, desc: '東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 96, status: 0 } ], key_id: 18 },
        { gimmick_id: 55, x: 16, y: -18, actions: [], keyGain: { id: 19, name: '塔・北東3Fの鍵' }, require: [], key_id: 0 },
      ]
    },
    {
      id: 50,
      zone: 2,
      floor: 4,
      orix: 4,
      oriy: 10.5,
      name: '東屋上',
      map: 'thana_boss',
      x: 189, y: 187,
      width: 30, height: 34,
      gimmicks: [
        { gimmick_id: 90, x: 20, y: 20, actions: [{ gimmick_id: 90, add: 1, desc: '東屋上のレバーを操作した。' }], keyGain: null, require: [ { gimmick_id: 90, status: 0 }], key_id: null }
      ]
    },
    {
      id: 51,
      zone: 2,
      floor: -1,
      orix: 12,
      oriy: 31.5,
      name: '南東B1F',
      map: 'ecl_tdun04',
      x: 11, y: 13,
      width: 34, height: 36,
      gimmicks: [
        { gimmick_id: 54, x: 35, y: 10, actions: [], keyGain: { id: 18, name: '塔・東3Fの鍵' }, require: [], key_id: 0 },
        { gimmick_id: 40, x: -25, y: 10, actions: [{ gimmick_id: 40, add: 1, desc: '<b>塔の化身サタナキア</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 40, status: 0 } ], key_id: null },
      ],
    },
    {
      id: 52,
      zone: 2,
      floor: 1,
      orix: 12,
      oriy: 29,
      name: '南東1F',
      map: 'ecl_tdun01',
      x: 5, y: 7,
      width: 110, height: 108,
      gimmicks: [
        { gimmick_id: 70, x: 0, y: 30, actions: [{ gimmick_id: 70, add: 1, desc: '転移の石碑で南東屋上に転移できるようになった。' }], keyGain: null, require: [ { gimmick_id: 70, status: 0 } ], key_id: 34 },
      ]
    },
    {
      id: 53,
      zone: 2,
      floor: 2,
      orix: 12,
      oriy: 26.5,
      name: '南東2F',
      map: 'ecl_tdun02',
      x: 11, y: 3,
      width: 96, height: 92,
      gimmicks: []
    },
    {
      id: 54,
      zone: 2,
      floor: 3,
      orix: 12,
      oriy: 24,
      name: '南東3F',
      map: 'ecl_tdun03',
      x: 5, y: 5,
      width: 90, height: 90,
      gimmicks: [
        { gimmick_id: 91, x: 75, y: 35, actions: [{ gimmick_id: 91, add: 1, desc: '「中庭（東）」↔「東1F」間のWPが開放された。' }], keyGain: null, require: [ { gimmick_id: 91, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 55,
      zone: 2,
      floor: 4,
      orix: 12,
      oriy: 22,
      name: '南東屋上',
      map: 'glast_01',
      x: 181, y: 44,
      width: 38, height: 38,
      gimmicks: [
        { gimmick_id: 95, x: -15, y: 25, actions: [{ gimmick_id: 95, add: 1, desc: '転移の石碑で南②屋上に転移できるようになった。' }], keyGain: null, require: [ { gimmick_id: 95, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 56,
      zone: 2,
      floor: 1,
      orix: 22,
      oriy: 30.5,
      name: '南②1F',
      map: 'yuno_in04',
      x: 155, y: 3,
      width: 42, height: 48,
      gimmicks: [
        { gimmick_id: 92, x: -15, y: 5, actions: [{ gimmick_id: 92, add: 1, desc: '南②1Fのレバーを操作した。' }], keyGain: null, require: [ { gimmick_id: 92, status: 0 } ], key_id: null },
        { gimmick_id: 93, x: 10, y: 50, actions: [{ gimmick_id: 93, add: 1, desc: '転移の石碑で南東3Fに転移できるようになった。' }], keyGain: null, require: [ { gimmick_id: 93, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 57,
      zone: 2,
      floor: 2,
      orix: 22,
      oriy: 28.5,
      name: '南②2F',
      map: 'yuno_in04',
      x: 89, y: 69,
      width: 40, height: 26,
      gimmicks: []
    },
    {
      id: 58,
      zone: 2,
      floor: 3,
      orix: 22,
      oriy: 26.5,
      name: '南②3F',
      map: 'yuno_in04',
      x: 23, y: 65,
      width: 36, height: 35,
      gimmicks: [
        { gimmick_id: 94, x: -15, y: -5, actions: [{ gimmick_id: 94, add: 1, desc: '転移の石碑で南東1Fに転移できるようになった。' }], keyGain: null, require: [ { gimmick_id: 94, status: 0 } ], key_id: null },
        { gimmick_id: 41, x: -15, y: 20, actions: [{ gimmick_id: 41, add: 1, desc: '<b>星の化身ガムビエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 41, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 59,
      zone: 2,
      floor: 4,
      orix: 22,
      oriy: 24.5,
      name: '南②屋上',
      map: 'glast_01',
      x: 85, y: 135,
      width: 31, height: 34,
      gimmicks: [
        { gimmick_id: 71, x: 10, y: -20, actions: [{ gimmick_id: 71, add: 1, desc: '転移の石碑で南東B1Fに転移できるようになった。' }], keyGain: null, require: [ { gimmick_id: 71, status: 0 } ], key_id: 35 },
        { gimmick_id: 39, x: -15, y: 15, actions: [{ gimmick_id: 39, add: 1, desc: '<b>悪魔の化身ハナエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 39, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 60,
      zone: 2,
      floor: 1,
      orix: 16,
      oriy: 9,
      name: '城壁1F08',
      map: 'gef_tower',
      x: 141, y: 101,
      width: 34, height: 76,
      gimmicks: [
        { gimmick_id: 73, x: 15, y: 3, actions: [{ gimmick_id: 73, add: 1, desc: '裏庭の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 73, status: 0 } ], key_id: 36 }
      ]
    },
    {
      id: 61,
      zone: 2,
      floor: 2,
      orix: 16,
      oriy: 7.3,
      name: '城壁2F08',
      map: 'tha_t06',
      x: 140, y: 110,
      width: 100, height: 20,
      gimmicks: [
        { gimmick_id: 73, x: 15, y: 0, actions: [], keyGain: { id: 36, name: '裏庭の鍵' }, require: [], key_id: 0 }
      ],
    },
    {
      id: 62,
      zone: 2,
      floor: 3,
      orix: 16,
      oriy: 5.5,
      name: '城壁通路08',
      map: 'prt_gld',
      x: 204, y: 59,
      width: 40, height: 16,
      gimmicks: [
        { gimmick_id: 55, x: 40, y: 8, actions: [{ gimmick_id: 55, add: 1, desc: '北東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 55, status: 0 } ], key_id: 19 }
      ]
    },
    {
      id: 63,
      zone: 2,
      floor: 2,
      orix: 8,
      oriy: 12,
      name: '城壁2F07',
      map: 'tha_t06',
      x: 109, y: 138,
      width: 22, height: 102,
      gimmicks: []
    },
    {
      id: 64,
      zone: 2,
      floor: 3,
      orix: 8,
      oriy: 9,
      name: '城壁通路06',
      map: 'prt_gld',
      x: 247, y: 80,
      width: 20, height: 46,
      gimmicks: [
        { gimmick_id: 96, x: 10, y: 45, actions: [{ gimmick_id: 96, add: 1, desc: '東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 96, status: 0 } ], key_id: 18 }
      ]
    },
    {
      id: 65,
      zone: 2,
      floor: 2,
      orix: 7,
      oriy: 22,
      name: '城壁2F06',
      map: 'tha_t06',
      x: 110, y: 0,
      width: 20, height: 99,
      gimmicks: [
        { gimmick_id: 61, x: 0, y: 63, actions: [{ gimmick_id: 61, add: 1, desc: '城壁2F06の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 61, status: 0 } ], key_id: 25 }
      ]
    },
    {
      id: 66,
      zone: 2,
      floor: 3,
      orix: 7,
      oriy: 19,
      name: '城壁通路04',
      map: '66',
      x: 0, y: 0,
      width: 42, height: 70,
      gimmicks: [
        { gimmick_id: 54, x: 37, y: 0, actions: [{ gimmick_id: 54, add: 1, desc: '東3Fの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 54, status: 0 } ], key_id: 18 }
      ]
    },
    {
      id: 67,
      zone: 2,
      floor: 2,
      orix: 17,
      oriy: 28,
      name: '城壁2F05',
      map: 'tha_t06',
      x: 0, y: 110,
      width: 100, height: 20,
      gimmicks: []
    },
    {
      id: 68,
      zone: 2,
      floor: 3,
      orix: 17,
      oriy: 26,
      name: '城壁通路02',
      map: 'prt_gld',
      x: 226, y: 247,
      width: 26, height: 20,
      gimmicks: []
    },
    {
      id: 69,
      zone: 0,
      floor: 1,
      orix: 14,
      oriy: 14.7,
      name: '中庭（東）',
      map: '69',
      x: 0, y: 0,
      width: 161, height: 144,
      gimmicks: [
        { gimmick_id: 62, x: 64, y: 88, actions: [{ gimmick_id: 62, add: 1, desc: 'ペコ舎の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 62, status: 0 } ], key_id: 26 },
        { gimmick_id: 98, x: 60, y: 19, actions: [{ gimmick_id: 98, add: 1, desc: '使用人居住区の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 98, status: 0 } ], key_id: 39 }
      ]
    },
    {
      id: 70, zone: 0, floor: 1, orix: 14, oriy: 19,
      name: 'ペコ舎', map: 'payon_in02',
      x: 9, y: 57, width: 26, height: 34,
      gimmicks: [
        { gimmick_id: 32, x: 15, y: 15, actions: [{ gimmick_id: 32, add: 1, desc: '<b>力の化身ウェルキエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 32, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 71, zone: 0, floor: 2, orix: 25, oriy: 13.4,
      name: '隊長室', map: 'kh_rossi',
      x: 77, y: 11, width: 24, height: 18,
      gimmicks: [
        { gimmick_id: 61, x: 0, y: -17, actions: [], keyGain: { id: 25, name: '城壁2F06の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 72, zone: 0, floor: 2, orix: 27, oriy: 11.5,
      name: '大部屋', map: 'kh_rossi',
      x: 11, y: 255, width: 34, height: 34,
      gimmicks: [
        { gimmick_id: 60, x: -15, y: 10, actions: [], keyGain: { id: 24, name: '兵舎2F 武器庫の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 73, zone: 0, floor: 2, orix: 30, oriy: 11.5,
      name: '兵舎2F武器庫', map: 'job3_rune01',
      x: 32, y: 30, width: 96, height: 40,
      gimmicks: [
        { gimmick_id: 60, x: 48, y: 40, actions: [{ gimmick_id: 60, add: 1, desc: '兵舎2F 武器庫の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 60, status: 0 } ], key_id: 24 },
        { gimmick_id: 61, x: 48, y: 0, actions: [{ gimmick_id: 61, add: 1, desc: '城壁2F06の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 61, status: 0 } ], key_id: 25 },
        { gimmick_id: 62, x: 5, y: 0, actions: [], keyGain: { id: 26, name: 'ペコ舎の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 74, zone: 0, floor: 2, orix: 27.3, oriy: 13.3,
      name: '兵舎2F通路', map: 'kh_rossi',
      x: 218, y: 214, width: 72, height: 28,
      gimmicks: [
        { gimmick_id: 60, x: 48, y: 0, actions: [{ gimmick_id: 60, add: 1, desc: '兵舎2F 武器庫の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 60, status: 0 } ], key_id: 24 }
      ]
    },
    {
      id: 75, zone: 0, floor: 1, orix: 20, oriy: 13.9,
      name: '部屋①', map: 'kh_rossi',
      x: 191, y: 11, width: 28, height: 12,
      gimmicks: [
        { gimmick_id: 59, x: -15, y: 5, actions: [], keyGain: { id: 23, name: '兵舎1F 武器庫の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 76, zone: 0, floor: 1, orix: 22.5, oriy: 13.5,
      name: '兵舎1F武器庫', map: '1@gl_k',
      x: 259, y: 77, width: 30, height: 28,
      gimmicks: []
    },
    {
      id: 77, zone: 0, floor: 1, orix: 21.5, oriy: 15.2,
      name: '兵舎1F通路', map: 'kh_rossi',
      x: 10, y: 187, width: 88, height: 34,
      gimmicks: [
        { gimmick_id: 59, x: 55, y: 12, actions: [{ gimmick_id: 59, add: 1, desc: '兵舎1F 武器庫の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 59, status: 0 } ], key_id: 23 }
      ]
    },
    {
      id: 78, zone: 0, floor: 1, orix: 20, oriy: 16.7,
      name: '部屋②', map: 'kh_rossi',
      x: 135, y: 105, width: 28, height: 16,
      gimmicks: []
    },
    {
      id: 79, zone: 0, floor: 1, orix: 21.5, oriy: 16.7,
      name: '部屋③', map: 'kh_rossi',
      x: 191, y: 105, width: 28, height: 16,
      gimmicks: []
    },
    {
      id: 80, zone: 0, floor: 1, orix: 23, oriy: 16.7,
      name: '部屋④', map: 'kh_rossi',
      x: 247, y: 105, width: 28, height: 16,
      gimmicks: []
    },
    {
      id: 81, zone: 4, floor: 1, orix: -2.5, oriy: 31.5,
      name: '礼拝堂', map: 'prt_church',
      x: 82, y: 72, width: 34, height: 72,
      gimmicks: [
        { gimmick_id: 25, x: 4, y: 15, actions: [{ gimmick_id: 25, add: 1, desc: '<b>魔術師の化身ルシフェル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 25, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 82, zone: 4, floor: 1, orix: -4.2, oriy: 32,
      name: '懺悔室', map: 'prt_church',
      x: 20, y: 20, width: 20, height: 16,
      gimmicks: []
    },
    {
      id: 83, zone: 4, floor: 1, orix: -0.8, oriy: 31.5,
      name: '教会倉庫', map: '83',
      x: 0, y: 0, width: 18, height: 16,
      gimmicks: []
    },
    {
      id: 84, zone: 4, floor: 1, orix: -4.5, oriy: 29.8,
      name: '教会1F通路02', map: '84',
      x: 0, y: 0, width: 12, height: 28,
      gimmicks: []
    },
    {
      id: 85, zone: 4, floor: 2, orix: -10.5, oriy: 29.3,
      name: '大会議室', map: '85',
      x: 0, y: 0, width: 24, height: 22,
      gimmicks: [
        { gimmick_id: 16, x: -6, y: -6, actions: [], keyGain: { id: 4, name: 'カタコンベの鍵' }, require: [], key_id: null },
        { gimmick_id: 30, x: 17, y: 3, actions: [{ gimmick_id: 30, add: 1, desc: '<b>恋人の化身アムブリエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 30, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 86, zone: 4, floor: 2, orix: -7.5, oriy: 30,
      name: '教会2F通路01', map: '86',
      x: 0, y: 0, width: 86, height: 57,
      gimmicks: []
    },
    {
      id: 87, zone: 4, floor: 2, orix: -10.5, oriy: 31,
      name: '会議室①', map: '87',
      x: 0, y: 0, width: 20, height: 26,
      gimmicks: []
    },
    {
      id: 88, zone: 4, floor: 2, orix: -6.8, oriy: 32.5,
      name: '教会2F通路02', map: '88',
      x: 0, y: 0, width: 36, height: 90,
      gimmicks: []
    },
    {
      id: 89, zone: 4, floor: 2, orix: -5.7, oriy: 32.4,
      name: '執務室', map: '89',
      x: 0, y: 0, width: 24, height: 26,
      gimmicks: [
        { gimmick_id: 17, x: 12, y: 12, actions: [], keyGain: { id: 5, name: '神殿通路1F02の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 90, zone: 4, floor: 2, orix: -5.7, oriy: 34,
      name: '会議室②', map: '90',
      x: 0, y: 0, width: 20, height: 28,
      gimmicks: []
    },
    {
      id: 91, zone: 4, floor: 1, orix: -1.5, oriy: 26,
      name: '教会1F通路01', map: '91',
      x: 0, y: 0, width: 36, height: 90,
      gimmicks: [
        { gimmick_id: 18, x: 0, y: 83, actions: [{ gimmick_id: 18, add: 1, desc: '鐘楼の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 18, status: 0 } ], key_id: 6 },
        { gimmick_id: 17, x: 27, y: 0, actions: [{ gimmick_id: 17, add: 1, desc: '神殿通路1F02の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 17, status: 0 } ], key_id: 5 }
      ]
    },
    {
      id: 92, zone: 4, floor: 1, orix: -3, oriy: 25.5,
      name: '会議室', map: '92',
      x: 0, y: 0, width: 24, height: 26,
      gimmicks: [
        { gimmick_id: 18, x: 12, y: 12, actions: [], keyGain: { id: 6, name: '鐘楼の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 93, zone: 4, floor: 4, orix: -5.2, oriy: 17.5,
      name: '鐘楼屋上', map: '5@tower',
      x: 0, y: 0, width: 48, height: 48,
      gimmicks: [
        { gimmick_id: 74, x: 40, y: 0, actions: [{ gimmick_id: 74, add: 1, desc: '釣鐘の部品を設置した。' }], keyGain: null, require: [ { gimmick_id: 74, status: 0 } ], key_id: 7 },
        { gimmick_id: 75, x: 40, y: 0, actions: [{ gimmick_id: 75, add: 1, desc: '釣鐘の部品を設置した。' }], keyGain: null, require: [ { gimmick_id: 75, status: 0 } ], key_id: 7 },
        { gimmick_id: 76, x: 40, y: 0, actions: [{ gimmick_id: 76, add: 1, desc: '釣鐘の部品を設置した。' }], keyGain: null, require: [ { gimmick_id: 76, status: 0 } ], key_id: 7 },
        { gimmick_id: 77, x: 40, y: 0, actions: [{ gimmick_id: 77, add: 1, desc: '釣鐘の部品を設置した。' }], keyGain: null, require: [ { gimmick_id: 77, status: 0 } ], key_id: 7 },
        { gimmick_id: 69, x: 40, y: 0, actions: [{ gimmick_id: 69, add: 1, desc: '鐘の音が響き渡り、カタコンベ祭壇の封印が解かれた。' }], keyGain: null,
        require: [
          { gimmick_id: 74, status: 1 }, { gimmick_id: 75, status: 1 }, { gimmick_id: 76, status: 1 }, { gimmick_id: 77, status: 1 }, { gimmick_id: 69, status: 0 }
        ], key_id: 33 },
      ]
    },
    {
      id: 94, zone: 4, floor: 3, orix: -5.2, oriy: 20,
      name: '鐘楼3F', map: '1@tower',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 95, zone: 4, floor: 2, orix: -5.2, oriy: 22.5,
      name: '鐘楼2F', map: '1@tower',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 96, zone: 4, floor: 1, orix: -5.2, oriy: 25,
      name: '鐘楼1F', map: '1@tower',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: []
    },
    {
      id: 97, zone: 4, floor: -1, orix: -5, oriy: 27.5,
      name: '鐘楼B1F', map: '97',
      x: 0, y: 0, width: 24, height: 22,
      gimmicks: [
        { gimmick_id: 72, x: 12, y: 12, actions: [], keyGain: { id: 7, name: '釣鐘の部品' }, require: [], key_id: null }
      ]
    },
    {
      id: 98, zone: 4, floor: -1, orix: -8, oriy: 27.5,
      name: '教会B1F通路', map: '98',
      x: 0, y: 0, width: 67, height: 18,
      gimmicks: [
        { gimmick_id: 16, x: 0, y: 13, actions: [{ gimmick_id: 16, add: 1, desc: 'カタコンベの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 16, status: 0 } ], key_id: 4 }
      ]
    },
    {
      id: 99, zone: 4, floor: -1, orix: -9.5, oriy: 25.8,
      name: 'カタコンベ部屋', map: '99',
      x: 0, y: 0, width: 18, height: 28,
      gimmicks: []
    },
    {
      id: 100, zone: 4, floor: -1, orix: -13.5, oriy: 27.8,
      name: 'カタコンベ祭壇', map: '100',
      x: 0, y: 0, width: 62, height: 78,
      gimmicks: [
        { gimmick_id: 28, x: 18, y: 30, actions: [{ gimmick_id: 28, add: 1, desc: '<b>皇帝の化身マルキダエル<b/>を倒した。' }], keyGain: null, require: [ { gimmick_id: 28, status: 0 }, { gimmick_id: 79, status: 1 }, { gimmick_id: 80, status: 1 }, { gimmick_id: 81, status: 1 } ], key_id: null },
        { gimmick_id: 78, x: 18, y: 30, actions: [], keyGain: null, require: [ { gimmick_id: 79, status: 0 } ], key_id: null },
        { gimmick_id: 78, x: 18, y: 30, actions: [], keyGain: null, require: [ { gimmick_id: 80, status: 0 } ], key_id: null },
        { gimmick_id: 78, x: 18, y: 30, actions: [], keyGain: null, require: [ { gimmick_id: 81, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 101, zone: 4, floor: -1, orix: -10.3, oriy: 24.3,
      name: 'カタコンベ宿泊施設', map: '101',
      x: 0, y: 0, width: 32, height: 36,
      gimmicks: []
    },
    {
      id: 102, zone: 4, floor: -1, orix: -12.5, oriy: 21.5,
      name: 'カタコンベ通路', map: '102',
      x: 0, y: 0, width: 172, height: 96,
      gimmicks: []
    },
    {
      id: 103, zone: 4, floor: -1, orix: -16.8, oriy: 23.5,
      name: 'カタコンベ倉庫', map: '103',
      x: 0, y: 0, width: 30, height: 36,
      gimmicks: [
        { gimmick_id: 82, x: 0, y: 40, actions: [{ gimmick_id: 82, add: 1, desc: '「カタコンベ通路」↔「墓①～④」の扉の鍵が開いた。' }], keyGain: null, require: [ { gimmick_id: 82, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 104, zone: 4, floor: -1, orix: -8.7, oriy: 20.5,
      name: '墓①', map: '104',
      x: 0, y: 0, width: 18, height: 18,
      gimmicks: [
        { gimmick_id: 79, x: 19, y: 6, actions: [{ gimmick_id: 79, add: 1, desc: '<b>カタコンベ墓①</b>の封印の祠は崩れ去った。<br/>注意※現実だと敵が強くて結構大変です' }], keyGain: null, require: [ { gimmick_id: 79, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 105, zone: 4, floor: -1, orix: -12.5, oriy: 24.3,
      name: '墓②', map: '105',
      x: 0, y: 0, width: 18, height: 19,
      gimmicks: [
        { gimmick_id: 80, x: 0, y: 27, actions: [{ gimmick_id: 80, add: 1, desc: '<b>カタコンベ墓②</b>の封印の祠は崩れ去った。<br/>注意※現実だと敵が強くて結構大変です' }], keyGain: null, require: [ { gimmick_id: 80, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 106, zone: 4, floor: -1, orix: -14.5, oriy: 24.3,
      name: '墓③', map: '106',
      x: 0, y: 0, width: 17, height: 19,
      gimmicks: [
        { gimmick_id: 81, x: 0, y: 27, actions: [{ gimmick_id: 81, add: 1, desc: '<b>カタコンベ墓③</b>の封印の祠は崩れ去った。<br/>注意※現実だと敵が強くて結構大変です' }], keyGain: null, require: [ { gimmick_id: 81, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 107, zone: 4, floor: -1, orix: -16.3, oriy: 20,
      name: '墓④', map: '107',
      x: 0, y: 0, width: 18, height: 17,
      gimmicks: []
    },
    {
      id: 108, zone: 4, floor: 0, orix: -13, oriy: 18,
      name: '浮き橋', map: '108',
      x: 0, y: 0, width: 19, height: 17,
      gimmicks: []
    },
    {
      id: 109, zone: 4, floor: 0, orix: -11, oriy: 18,
      name: '浮き橋奥', map: '109',
      x: 0, y: 0, width: 10, height: 17,
      gimmicks: []
    },
    {
      id: 110, zone: 4, floor: -1, orix: -9, oriy: 17,
      name: '祈りの間', map: '110',
      x: 0, y: 0, width: 10, height: 14,
      gimmicks: [
        { gimmick_id: 19, x: 13, y: -15, actions: [], keyGain: { id: 8, name: '財の間の鍵' }, require: [], key_id: null },
        { gimmick_id: 47, x: 13, y: 16, actions: [ { gimmick_id: 47, add: 1, desc: '<b>魔獣ブロールホース</b>を倒した。' } ], keyGain: null, require: [ { gimmick_id: 47, status: 0 }], key_id: null },
      ]
    },
    {
      id: 111, zone: 4, floor: 1, orix: -3, oriy: 22.5,
      name: '神殿通路1F02', map: '111',
      x: 0, y: 0, width: 8, height: 40,
      gimmicks: []
    },
    {
      id: 112, zone: 4, floor: 1, orix: -1, oriy: 20,
      name: '神殿大広間', map: '112',
      x: 0, y: 0, width: 64, height: 128,
      gimmicks: [
        { gimmick_id: 31, x: 19, y: 20, actions: [
          { gimmick_id: 31, add: 1, desc: '<b>戦車の化身ムリエル</b>を倒した。' },
          { gimmick_id: 84, add: -1, desc: '祭殿から出られるようになった。'}
        ], keyGain: null, require: [
          { gimmick_id: 31, status: 0 },
          { gimmick_id: 35, status: 1 },
          { gimmick_id: 45, status: 1 }
        ], key_id: null },
        { gimmick_id: 78, x: 19, y: 20, actions: [], keyGain: null, require: [ { gimmick_id: 35, status: 0 } ], key_id: null },
        { gimmick_id: 78, x: 19, y: 20, actions: [], keyGain: null, require: [ { gimmick_id: 45, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 113, zone: 4, floor: 1, orix: -3, oriy: 16.3,
      name: '騎士の間', map: '113',
      x: 0, y: 0, width: 36, height: 36,
      gimmicks: [
        { gimmick_id: 35, x: 5, y: 15, actions: [{ gimmick_id: 35, add: 1, desc: '<b>正義の化身ズリエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 35, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 114, zone: 4, floor: 1, orix: 1, oriy: 16,
      name: '王妃の間', map: '114',
      x: 0, y: 0, width: 62, height: 50,
      gimmicks: [
        { gimmick_id: 45, x: 18, y: 15, actions: [{ gimmick_id: 45, add: 1, desc: '<b>世界の化身サタン</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 45, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 115, zone: 4, floor: 1, orix: 0, oriy: 10.5,
      name: '祭殿', map: '115',
      x: 0, y: 0, width: 126, height: 196,
      gimmicks: [
        { gimmick_id: 83, x: 106, y: 96, actions: [
          { gimmick_id: 83, add: 1, desc: '祭殿に身を捧げた。' },
          { gimmick_id: 84, add: 1, desc: '歩いて出られなくなったので、他のチームに助けてもらうかセーブポイントに戻ろう。' },
        ], keyGain: null, require: [
          { gimmick_id: 83, status: 0 },
          { gimmick_id: 31, status: 0 },
        ], key_id: 37 }
      ]
    },
    {
      id: 116, zone: 4, floor: 1, orix: 4, oriy: 8,
      name: '神殿通路1F01', map: '116',
      x: 0, y: 0, width: 8, height: 33,
      gimmicks: []
    },
    {
      id: 117, zone: 4, floor: 1, orix: 4, oriy: 4,
      name: '控えの間', map: '117',
      x: 0, y: 0, width: 104, height: 76,
      gimmicks: []
    },
    {
      id: 118, zone: 5, floor: -1, orix: 28, oriy: 0.7,
      name: '地下牢①', map: 'abbey03',
      x: 4, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 119, zone: 5, floor: -1, orix: 28.8, oriy: 1.5,
      name: '地下牢②', map: 'abbey03',
      x: 40, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 120, zone: 5, floor: -1, orix: 29.6, oriy: 2.3,
      name: '地下牢③', map: 'abbey03',
      x: 76, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 121, zone: 5, floor: -1, orix: 30.4, oriy: 3.1,
      name: '地下牢④', map: 'abbey03',
      x: 112, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 122, zone: 5, floor: -1, orix: 31.2, oriy: 3.9,
      name: '地下牢⑤', map: 'abbey03',
      x: 148, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 123, zone: 5, floor: -1, orix: 32, oriy: 4.7,
      name: '地下牢⑥', map: 'abbey03',
      x: 184, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 124, zone: 5, floor: -1, orix: 32.8, oriy: 5.5,
      name: '地下牢⑦', map: 'abbey03',
      x: 220, y: 4, width: 16, height: 16,
      gimmicks: []
    },
    {
      id: 125, zone: 5, floor: -1, orix: 29.5, oriy: 4.5,
      name: '地下牢通路', map: 'abbey03',
      x: 4, y: 20, width: 232, height: 20,
      gimmicks: [
        { gimmick_id: 58, x: 164, y: 13, actions: [{ gimmick_id: 58, add: 1, desc: '拷問部屋の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 58, status: 0 } ], key_id: 22 }
      ]
    },
    {
      id: 126, zone: 5, floor: -1, orix: 25.7, oriy: 4.2,
      name: '看守部屋', map: 'gl_prison1',
      x: 148, y: 166, width: 40, height: 24,
      gimmicks: [
        { gimmick_id: 58, x: 40, y: 12, actions: [], keyGain: { id: 22, name: '拷問部屋の鍵' }, require: [], key_id: 0 }
      ],
    },
    {
      id: 127, zone: 5, floor: -1, orix: 28, oriy: 7,
      name: '拷問部屋', map: '127',
      x: 0, y: 0, width: 52, height: 51,
      gimmicks: [
        { gimmick_id: 36, x: 13, y: 25, actions: [{ gimmick_id: 36, add: 1, desc: '<b>吊るされた男の化身ネビロス</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 36, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 128, zone: 5, floor: 0, orix: 13, oriy: 6,
      name: '噴水基部', map: '128',
      x: 0, y: 0, width: 63, height: 40,
      gimmicks: []
    },
    {
      id: 129, zone: 5, floor: 0, orix: 2.5, oriy: 14,
      name: '水路01', map: '129',
      x: 0, y: 0, width: 106, height: 41,
      gimmicks: []
    },
    {
      id: 130, zone: 5, floor: 0, orix: 18.5, oriy: 6,
      name: '噴水最深部', map: '130',
      x: 0, y: 0, width: 24, height: 24,
      gimmicks: [
        { gimmick_id: 19, x: 19, y: 19, actions: [{ gimmick_id: 19, add: 1, desc: '財の間の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 19, status: 0 } ], key_id: 8 }
      ]
    },
    {
      id: 131, zone: 5, floor: -1, orix: 22, oriy: 7,
      name: '財の間', map: '131',
      x: 0, y: 0, width: 65, height: 56,
      gimmicks: [
        { gimmick_id: 48, x: 18, y: 20, actions: [ { gimmick_id: 48, add: 1, desc: '<b>魔獣シューターデーモン</b>を倒した。' } ], keyGain: null, require: [ { gimmick_id: 48, status: 0 }], key_id: null },
      ]
    },
    {
      id: 132, zone: 5, floor: 0, orix: 0.2, oriy: 17.2,
      name: '南井戸の底', map: '132',
      x: 0, y: 0, width: 24, height: 24,
      gimmicks: []
    },
    {
      id: 133, zone: 5, floor: 1, orix: 12.5, oriy: 3,
      name: '秘密の庭', map: '133',
      x: 0, y: 0, width: 55, height: 53,
      gimmicks: [
        { gimmick_id: 64, x: 15, y: 25, actions: [{ gimmick_id: 64, add: 1, desc: '王家の花の種をプランターに植えた。' }], keyGain: { id: 28, name: '王家の花' }, require: [
          { gimmick_id: 13, status: 2 }
        ], key_id: 27 },
        { gimmick_id: 99, x: 15, y: 25, actions: [], keyGain: null, require: [
          { gimmick_id: 97, status: 0 }
        ], key_id: null },
      ]
    },
    {
      id: 134, zone: 5, floor: 0, orix: 18.7, oriy: 4,
      name: '水路03', map: '134',
      x: 0, y: 0, width: 88, height: 33,
      gimmicks: []
    },
    {
      id: 135, zone: 5, floor: 0, orix: 14.5, oriy: 2,
      name: '水路02', map: '135',
      x: 0, y: 0, width: 14, height: 81,
      gimmicks: []
    },
    {
      id: 136, zone: 5, floor: -1, orix: 14, oriy: -2,
      name: '墓地地下室', map: '136',
      x: 0, y: 0, width: 28, height: 18,
      gimmicks: []
    },
    {
      id: 137, zone: 5, floor: 1, orix: 12, oriy: -1.5,
      name: '墓地', map: '137',
      x: 0, y: 0, width: 61, height: 45,
      gimmicks: [
        { gimmick_id: 37, x: 28, y: 20, actions: [{ gimmick_id: 37, add: 1, desc: '<b>死神の化身バルビエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 37, status: 0 } ], key_id: null },
        { gimmick_id: 63, x: 0, y: 0, actions: [], keyGain: { id: 27, name: '王家の花の種' }, require: [], key_id: null }
      ]
    },
    {
      id: 138, zone: 5, floor: -1, orix: 18, oriy: -0.2,
      name: '城内通路B1F', map: '138',
      x: 0, y: 0, width: 36, height: 58,
      gimmicks: []
    },
    {
      id: 139, zone: 5, floor: 0, orix: 21.3, oriy: 1.5,
      name: '北井戸の底', map: '139',
      x: 0, y: 0, width: 24, height: 24,
      gimmicks: []
    },
    {
      id: 140, zone: 5, floor: 1, orix: 21.3, oriy: -1.3,
      name: '裏庭', map: '140',
      x: 0, y: 0, width: 52, height: 62,
      gimmicks: [
        { gimmick_id: 73, x: 10, y: 27, actions: [{ gimmick_id: 73, add: 1, desc: '裏庭の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 73, status: 0 } ], key_id: 36 }
      ]
    },
    {
      id: 141, zone: 8, floor: 1, orix: 17, oriy: 29.8,
      name: '使用人居住区', map: '141',
      x: 0, y: 0, width: 30, height: 56,
      gimmicks: [
        { gimmick_id: 98, x: 12, y: 55, actions: [{ gimmick_id: 98, add: 1, desc: '使用人居住区の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 98, status: 0 } ], key_id: 39 }
      ]
    },
    {
      id: 142, zone: 8, floor: 1, orix: 14, oriy: 30.8,
      name: '使用人部屋①', map: '142',
      x: 0, y: 0, width: 18, height: 24,
      gimmicks: [
        { gimmick_id: 98, x: -10, y: 10, actions: [], keyGain: { id: 39, name: '使用人居住区の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 143, zone: 8, floor: 1, orix: 14, oriy: 29.3,
      name: '使用人部屋②', map: '143',
      x: 0, y: 0, width: 18, height: 20,
      gimmicks: []
    },
    {
      id: 144, zone: 8, floor: 1, orix: 19, oriy: 29.8,
      name: '使用人部屋③', map: '144',
      x: 0, y: 0, width: 32, height: 18,
      gimmicks: []
    },
    {
      id: 145, zone: 8, floor: 1, orix: 18, oriy: 27.3,
      name: '召使い部屋', map: '145',
      x: 0, y: 0, width: 54, height: 26,
      gimmicks: [
        { gimmick_id: 38, x: 20, y: 10, actions: [{ gimmick_id: 38, add: 1, desc: '<b>節制の化身アドナキエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 38, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 146, zone: 8, floor: 1, orix: 18, oriy: 22,
      name: '炊事場', map: '146',
      x: 0, y: 0, width: 32, height: 24,
      gimmicks: []
    },
    {
      id: 147, zone: 8, floor: 1, orix: 8, oriy: 32.5,
      name: '中庭（北）', map: '147',
      x: 0, y: 0, width: 50, height: 80,
      gimmicks: []
    },
    {
      id: 148, zone: 8, floor: 1, orix: 7.5, oriy: 29.5,
      name: '城門②1F', map: '148',
      x: 0, y: 0, width: 20, height: 52,
      gimmicks: [
        { gimmick_id: 66, x: 19, y: 5, actions: [{ gimmick_id: 66, add: 1, desc: '渾身の力を込めて扉をぶち破った。' }], keyGain: null, require: [ { gimmick_id: 66, status: 0 } ], key_id: 30 }
      ]
    },
    {
      id: 149, zone: 8, floor: 1, orix: 7.1, oriy: 26.5,
      name: 'エントランス', map: '149',
      x: 0, y: 0, width: 92, height: 68,
      gimmicks: [
        { gimmick_id: 20, x: 5, y: 0, actions: [{ gimmick_id: 20, add: 1, desc: 'エントランスの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 20, status: 0 } ], key_id: 9 }
      ]
    },
    {
      id: 150, zone: 8, floor: 1, orix: 5, oriy: 28.5,
      name: '待合室①', map: '150',
      x: 0, y: 0, width: 38, height: 32,
      gimmicks: []
    },
    {
      id: 151, zone: 8, floor: 1, orix: 10, oriy: 28.5,
      name: '待合室②', map: '151',
      x: 0, y: 0, width: 36, height: 24,
      gimmicks: []
    },
    {
      id: 152, zone: 8, floor: 1, orix: 5.5, oriy: 24.5,
      name: '待合室③', map: '152',
      x: 0, y: 0, width: 42, height: 24,
      gimmicks: [
        { gimmick_id: 20, x: -10, y: 20, actions: [{ gimmick_id: 20, add: 1, desc: 'エントランスの鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 20, status: 0 } ], key_id: 9 }
      ]
    },
    {
      id: 153, zone: 8, floor: 1, orix: 10, oriy: 25.5,
      name: '城内通路1F01', map: '153',
      x: 0, y: 0, width: 71, height: 44,
      gimmicks: [
        { gimmick_id: 24, x: 70, y: 20.5, actions: [{ gimmick_id: 24, add: 1, desc: '貴賓室の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 24, status: 0 } ], key_id: 13 }
      ]
    },
    {
      id: 154, zone: 8, floor: 1, orix: 12.5, oriy: 25,
      name: '貴賓室', map: '154',
      x: 0, y: 0, width: 28, height: 17,
      gimmicks: [
        { gimmick_id: 50, x: 10, y: 23, actions: [], keyGain: { id: 14, name: '大貴賓室の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 155, zone: 8, floor: 1, orix: 7.5, oriy: 21.5,
      name: '大ホール', map: '155',
      x: 0, y: 0, width: 110, height: 121,
      gimmicks: [
        { gimmick_id: 26, x: 42, y: 30, actions: [{ gimmick_id: 26, add: 1, desc: '<b>女教皇の化身フローレティ</b>を倒した。' }], keyGain: null, require: [
          { gimmick_id: 26, status: 0 }, { gimmick_id: 21, status: 1 }, { gimmick_id: 22, status: 1 }, { gimmick_id: 23, status: 1 }
        ], key_id: null },
        { gimmick_id: 78, x: 42, y: 30, actions: [], keyGain: null, require: [
          { gimmick_id: 21, status: 0 }
        ], key_id: null },
        { gimmick_id: 78, x: 42, y: 30, actions: [], keyGain: null, require: [
          { gimmick_id: 22, status: 0 }
        ], key_id: null },
        { gimmick_id: 78, x: 42, y: 30, actions: [], keyGain: null, require: [
          { gimmick_id: 23, status: 0 }
        ], key_id: null }
      ]
    },
    {
      id: 156, zone: 8, floor: 1, orix: 4, oriy: 23,
      name: '小ホール①', map: '156',
      x: 0, y: 0, width: 30, height: 40,
      gimmicks: [
        { gimmick_id: 22, x: 3, y: 30, actions: [{ gimmick_id: 22, add: 1, desc: '緑の宝石をはめた。' }], keyGain: null, require: [ { gimmick_id: 22, status: 0 } ], key_id: 11 }
      ]
    },
    {
      id: 157, zone: 8, floor: 1, orix: 4, oriy: 21,
      name: '小ホール②', map: '157',
      x: 0, y: 0, width: 26, height: 24,
      gimmicks: [
        { gimmick_id: 21, x: -11, y: 20, actions: [{ gimmick_id: 21, add: 1, desc: '赤の宝石をはめた。' }], keyGain: null, require: [ { gimmick_id: 21, status: 0 } ], key_id: 10 }
      ]
    },
    {
      id: 158, zone: 8, floor: 1, orix: 11.5, oriy: 23,
      name: '中ホール', map: '158',
      x: 0, y: 0, width: 62, height: 56,
      gimmicks: [
        { gimmick_id: 23, x: 24, y: 24, actions: [{ gimmick_id: 23, add: 1, desc: '黒の宝石をはめた。' }], keyGain: null, require: [ { gimmick_id: 23, status: 0 } ], key_id: 12 }
      ]
    },
    {
      id: 159, zone: 8, floor: 1, orix: 12, oriy: 20.5,
      name: '城内通路1F02', map: '159',
      x: 0, y: 0, width: 68, height: 33,
      gimmicks: []
    },
    {
      id: 160, zone: 7, floor: 2, orix: 5.5, oriy: 11.9,
      name: 'バルコニー①', map: '160',
      x: 0, y: 0, width: 38, height: 16,
      gimmicks: []
    },
    {
      id: 161, zone: 7, floor: 2, orix: 5, oriy: 10.5,
      name: 'ヴンダーカンマー', map: '161',
      x: 0, y: 0, width: 22, height: 30,
      gimmicks: [
        { gimmick_id: 21, x: 24, y: 10, actions: [], keyGain: { id: 10, name: '赤の宝石' }, require: [ { gimmick_id: 21, status: 0 } ], key_id: null },
        { gimmick_id: 22, x: -29, y: 16, actions: [], keyGain: { id: 11, name: '緑の宝石' }, require: [ { gimmick_id: 22, status: 0 } ], key_id: null },
        { gimmick_id: 23, x: -12, y: 8, actions: [], keyGain: { id: 12, name: '黒の宝石' }, require: [ { gimmick_id: 23, status: 0 } ], key_id: null },
        { gimmick_id: 85, x: 0, y: -15, actions: [], keyGain: null, require: [ { gimmick_id: 65, status: 0 } ], key_id: null },
        { gimmick_id: 86, x: 0, y: -15, actions: [], keyGain: { id: 38, name: 'たくさんの石' }, require: [ { gimmick_id: 65, status: 1 }, { gimmick_id: 88, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 162, zone: 7, floor: 2, orix: 7, oriy: 13.2,
      name: 'バルコニー②', map: '162',
      x: 0, y: 0, width: 12, height: 58,
      gimmicks: []
    },
    {
      id: 163, zone: 7, floor: 2, orix: 8.9, oriy: 10.2,
      name: '待機室2F', map: '163',
      x: 0, y: 0, width: 33, height: 34,
      gimmicks: []
    },
    {
      id: 164, zone: 7, floor: 2, orix: 8.9, oriy: 13.7,
      name: '城門②2F', map: '164',
      x: 0, y: 0, width: 34, height: 38,
      gimmicks: [
        { gimmick_id: 20, x: 24, y: 10, actions: [], keyGain: { id: 9, name: 'エントランスの鍵' }, require: [], key_id: null },
      ]
    },
    {
      id: 165, zone: 7, floor: 2, orix: 5.5, oriy: 14.5,
      name: 'バルコニー③', map: '165',
      x: 0, y: 0, width: 37, height: 16,
      gimmicks: []
    },
    {
      id: 166, zone: 7, floor: 2, orix: 6.5, oriy: 17,
      name: '謁見の間', map: '166',
      x: 0, y: 0, width: 52, height: 72,
      gimmicks: [
        { gimmick_id: 87, x: 0, y: 10, actions: [{ gimmick_id: 87, add: 1, desc: '「謁見の間」↔「円卓の間」の扉の鍵が開いた。' }], keyGain: null, require: [ { gimmick_id: 87, status: 0 } ], key_id: 38 },
        { gimmick_id: 34, x: 30, y: 34, actions: [{ gimmick_id: 34, add: 1, desc: '<b>運命の輪の化身アガリアレプト</b>を倒した。' }], keyGain: null, require: [
          { gimmick_id: 34, status: 0 },
          { gimmick_id: 88, status: 1 }
        ], key_id: null },
        { gimmick_id: 78, x: 30, y: 34, actions: [], keyGain: null, require: [ { gimmick_id: 88, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 167, zone: 7, floor: 2, orix: 3, oriy: 18.5,
      name: '図書室', map: '167',
      x: 0, y: 0, width: 26, height: 18,
      gimmicks: [
        { gimmick_id: 89, x: 24, y: 3, actions: [{ gimmick_id: 65, add: 1, desc: '<b>図書室</b>のレバーを操作した。' }, { gimmick_id: 89, add: 1, desc: '<b>バルコニー②</b>の重量制限が解除された。' }], keyGain: null, require: [ { gimmick_id: 89, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 168, zone: 7, floor: 2, orix: 8.5, oriy: 18.5,
      name: '会議室', map: '168',
      x: 0, y: 0, width: 40, height: 28,
      gimmicks: []
    },
    {
      id: 169, zone: 7, floor: 2, orix: 3.8, oriy: 16,
      name: '円卓の間', map: '169',
      x: 0, y: 0, width: 56, height: 42,
      gimmicks: [
        { gimmick_id: 88, x: 15, y: 38, actions: [{ gimmick_id: 88, add: 1, desc: '<b>謁見の間</b>の魔力障壁が解除された。' }], keyGain: null, require: [ { gimmick_id: 88, status: 0 } ], key_id: null }
      ]
    },
    {
      id: 170, zone: 7, floor: 2, orix: 9, oriy: 16,
      name: '執務室', map: '170',
      x: 0, y: 0, width: 32, height: 39,
      gimmicks: [
        { gimmick_id: 24, x: 10, y: 39, actions: [], keyGain: { id: 13, name: '貴賓室の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 171, zone: 7, floor: 2, orix: 14.5, oriy: 14,
      name: '城内通路2F01', map: '171',
      x: 0, y: 0, width: 126, height: 42,
      gimmicks: [
        { gimmick_id: 50, x: 64, y: 0, actions: [{ gimmick_id: 50, add: 1, desc: '大貴賓室の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 50, status: 0 } ], key_id: 14 },
        { gimmick_id: 53, x: 116, y: 5, actions: [{ gimmick_id: 53, add: 1, desc: '城内通路2F03の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 53, status: 0 } ], key_id: 17 }
      ]
    },
    {
      id: 172, zone: 7, floor: 2, orix: 11, oriy: 13.5,
      name: '来客室①', map: '172',
      x: 0, y: 0, width: 28, height: 18,
      gimmicks: []
    },
    {
      id: 173, zone: 7, floor: 2, orix: 11, oriy: 11.5,
      name: '医務室', map: '173',
      x: 0, y: 0, width: 36, height: 36,
      gimmicks: [
        { gimmick_id: 51, x: 30, y: 0, actions: [], keyGain: { id: 15, name: '城内通路3F01の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 174, zone: 7, floor: 2, orix: 12, oriy: 16.5,
      name: '来客室②', map: '174',
      x: 0, y: 0, width: 28, height: 17,
      gimmicks: []
    },
    {
      id: 175, zone: 7, floor: 2, orix: 13.8, oriy: 16.5,
      name: '来客室③', map: '175',
      x: 0, y: 0, width: 28, height: 17,
      gimmicks: []
    },
    {
      id: 176, zone: 7, floor: 2, orix: 13.5, oriy: 11.5,
      name: '大貴賓室', map: '176',
      x: 0, y: 0, width: 40, height: 54,
      gimmicks: [
        { gimmick_id: 44, x: 7, y: 15, actions: [{ gimmick_id: 44, add: 1, desc: '<b>審判の化身サルガタナス</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 44, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 177, zone: 7, floor: 2, orix: 18, oriy: 12.2,
      name: '城内通路2F02', map: '177',
      x: 0, y: 0, width: 24, height: 16,
      gimmicks: [
        { gimmick_id: 51, x: 11, y: 16, actions: [{ gimmick_id: 51, add: 1, desc: '城内通路3F01の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 51, status: 0 } ], key_id: 15 }
      ]
    },
    {
      id: 178, zone: 6, floor: 3, orix: 18, oriy: 5,
      name: '城内通路3F01', map: '178',
      x: 0, y: 0, width: 30, height: 17,
      gimmicks: []
    },
    {
      id: 179, zone: 6, floor: 3, orix: 12.25, oriy: 5,
      name: '城内通路3F02', map: '179',
      x: 0, y: 0, width: 64, height: 24,
      gimmicks: [
        { gimmick_id: 52, x: 32, y: 10, actions: [{ gimmick_id: 52, add: 1, desc: '小礼拝堂の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 52, status: 0 } ], key_id: 16 }
      ]
    },
    {
      id: 180, zone: 6, floor: 3, orix: 12.25, oriy: 3,
      name: '小礼拝堂', map: '180',
      x: 0, y: 0, width: 16, height: 16,
      gimmicks: [
        { gimmick_id: 53, x: 15, y: 12, actions: [], keyGain: { id: 17, name: '城内通路2F03の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 181, zone: 6, floor: 3, orix: 8.8, oriy: 7.5,
      name: '城内通路3F03', map: '181',
      x: 0, y: 0, width: 22, height: 80,
      gimmicks: []
    },
    {
      id: 182, zone: 6, floor: 3, orix: 10.5, oriy: 7,
      name: '王子の寝室', map: '182',
      x: 0, y: 0, width: 18, height: 18,
      gimmicks: []
    },
    {
      id: 183, zone: 6, floor: 3, orix: 10.5, oriy: 8.5,
      name: '王女の寝室', map: '183',
      x: 0, y: 0, width: 13, height: 18,
      gimmicks: []
    },
    {
      id: 184, zone: 6, floor: 3, orix: 11, oriy: 10,
      name: '王妃の寝室', map: '184',
      x: 0, y: 0, width: 20, height: 21,
      gimmicks: []
    },
    {
      id: 185, zone: 6, floor: 3, orix: 9, oriy: 11,
      name: '王の部屋', map: '185',
      x: 0, y: 0, width: 22, height: 32,
      gimmicks: [
        { gimmick_id: 29, x: 10, y: 32, actions: [{ gimmick_id: 29, add: 1, desc: '<b>法王の化身アスモデル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 29, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 186, zone: 6, floor: 3, orix: 11, oriy: 11.3,
      name: '王の寝室', map: '186',
      x: 0, y: 0, width: 20, height: 14,
      gimmicks: [
        { gimmick_id: 52, x: 20, y: 12, actions: [], keyGain: { id: 16, name: '小礼拝堂の鍵' }, require: [], key_id: null }
      ]
    },
    {
      id: 187, zone: 6, floor: 3, orix: 7, oriy: 10.5,
      name: '王妃の部屋', map: '187',
      x: 0, y: 0, width: 22, height: 34,
      gimmicks: [
        { gimmick_id: 27, x: 10, y: 34, actions: [{ gimmick_id: 27, add: 1, desc: '<b>女帝の化身アスタロト</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 27, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 188, zone: 6, floor: 3, orix: 15.7, oriy: 7.5,
      name: '城内通路3F04', map: '188',
      x: 0, y: 0, width: 24, height: 78,
      gimmicks: []
    },
    {
      id: 189, zone: 6, floor: 3, orix: 13.5, oriy: 7,
      name: '客間', map: '189',
      x: 0, y: 0, width: 44, height: 40,
      gimmicks: []
    },
    {
      id: 190, zone: 6, floor: 3, orix: 13.5, oriy: 9,
      name: '王女の部屋', map: '190',
      x: 0, y: 0, width: 22, height: 32,
      gimmicks: [
        { gimmick_id: 42, x: -20, y: 10, actions: [{ gimmick_id: 42, add: 1, desc: '<b>月の化身バキエル</b>を倒した。' }], keyGain: null, require: [ { gimmick_id: 42, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 191, zone: 6, floor: 3, orix: 13.5, oriy: 10.7,
      name: '王子の部屋', map: '191',
      x: 0, y: 0, width: 23, height: 34,
      gimmicks: [
        { gimmick_id: 33, x: -20, y: 10, actions: [
          { gimmick_id: 33, add: 1, desc: '<b>隠者の化身ハマリエル</b>を倒した。' }
        ], keyGain: null, require: [ { gimmick_id: 33, status: 0 } ], key_id: null },
      ]
    },
    {
      id: 192, zone: 6, floor: 3, orix: 15, oriy: 11,
      name: '応接間', map: '192',
      x: 0, y: 0, width: 32, height: 24,
      gimmicks: []
    },
    {
      id: 193, zone: 6, floor: 3, orix: 17, oriy: 8,
      name: 'グレートホール', map: '193',
      x: 0, y: 0, width: 40, height: 40,
      gimmicks: []
    },
    {
      id: 194, zone: 6, floor: 3, orix: 17.2, oriy: 10.3,
      name: '食堂', map: '194',
      x: 0, y: 0, width: 33, height: 34,
      gimmicks: []
    },
    {
      id: 195, zone: 7, floor: 2, orix: 14.5, oriy: 9,
      name: '城内通路2F03', map: '195',
      x: 0, y: 0, width: 30, height: 24,
      gimmicks: [
        { gimmick_id: 53, x: 30, y: 10, actions: [{ gimmick_id: 53, add: 1, desc: '城内通路2F03の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 53, status: 0 } ], key_id: 17 }
      ]
    },
    {
      id: 196, zone: 6, floor: 1, orix: 4, oriy: 5,
      name: '王の墓', map: '196',
      x: 0, y: 0, width: 32, height: 40,
      gimmicks: [
        { gimmick_id: 100, x: 6, y: -22, actions: [{ gimmick_id: 100, add: 1, desc: '王の墓に王家の花を捧げた。' }], keyGain: null, require: [ { gimmick_id: 100, status: 0 } ], key_id: 28 }
      ]
    },
    {
      id: 197, zone: 6, floor: -1, orix: -1, oriy: 7.5,
      name: '王の墓B1F', map: '197',
      x: 0, y: 0, width: 32, height: 34,
      gimmicks: []
    },
    {
      id: 198, zone: 6, floor: -1, orix: -1, oriy: 3.5,
      name: '神殿B1通路', map: '198',
      x: 0, y: 0, width: 26, height: 28,
      gimmicks: [
        { gimmick_id: 14, x: 22, y: 25, actions: [{ gimmick_id: 14, add: 1, desc: '地下宝物庫の鍵を開けた。' }], keyGain: null, require: [ { gimmick_id: 14, status: 0 } ], key_id: 3 }
      ]
    },
    {
      id: 199, zone: 6, floor: -1, orix: 0.8, oriy: 5,
      name: '地下宝物庫', map: '199',
      x: 0, y: 0, width: 20, height: 50,
      gimmicks: [
        { gimmick_id: 49, x: 20, y: 14, actions: [ { gimmick_id: 49, add: 1, desc: '<b>魔獣マジックビースト</b>を倒した。' } ], keyGain: null, require: [ { gimmick_id: 49, status: 0 }], key_id: null },
      ]
    },
    {
      id: 1001, zone: 9, floor: 6, orix: 0, oriy: 0,
      name: 'I', map: 'angel1',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 25, x: 0, y: 0, actions: [{ gimmick_id: 25, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 25, status: 0 } ], key_id: null },
        { gimmick_id: 25, x: 0, y: 0, actions: [{ gimmick_id: 25, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 25, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1002, zone: 9, floor: 6, orix: 1, oriy: 0,
      name: 'II', map: 'angel2',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 26, x: 0, y: 0, actions: [{ gimmick_id: 26, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 26, status: 0 } ], key_id: null },
        { gimmick_id: 26, x: 0, y: 0, actions: [{ gimmick_id: 26, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 26, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1003, zone: 9, floor: 6, orix: 2, oriy: 0,
      name: 'III', map: 'angel3',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 27, x: 0, y: 0, actions: [{ gimmick_id: 27, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 27, status: 0 } ], key_id: null },
        { gimmick_id: 27, x: 0, y: 0, actions: [{ gimmick_id: 27, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 27, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1004, zone: 9, floor: 6, orix: 3, oriy: 0,
      name: 'IV', map: 'angel4',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 28, x: 0, y: 0, actions: [{ gimmick_id: 28, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 28, status: 0 } ], key_id: null },
        { gimmick_id: 28, x: 0, y: 0, actions: [{ gimmick_id: 28, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 28, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1005, zone: 9, floor: 6, orix: 4, oriy: 0,
      name: 'V', map: 'angel5',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 29, x: 0, y: 0, actions: [{ gimmick_id: 29, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 29, status: 0 } ], key_id: null },
        { gimmick_id: 29, x: 0, y: 0, actions: [{ gimmick_id: 29, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 29, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1006, zone: 9, floor: 6, orix: 5, oriy: 0,
      name: 'VI', map: 'angel6',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 30, x: 0, y: 0, actions: [{ gimmick_id: 30, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 30, status: 0 } ], key_id: null },
        { gimmick_id: 30, x: 0, y: 0, actions: [{ gimmick_id: 30, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 30, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1007, zone: 9, floor: 6, orix: 6, oriy: 0,
      name: 'VII', map: 'angel7',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 31, x: 0, y: 0, actions: [{ gimmick_id: 31, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 31, status: 0 } ], key_id: null },
        { gimmick_id: 31, x: 0, y: 0, actions: [{ gimmick_id: 31, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 31, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1008, zone: 9, floor: 6, orix: 0, oriy: 1,
      name: 'VIII', map: 'angel8',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 32, x: 0, y: 0, actions: [{ gimmick_id: 32, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 32, status: 0 } ], key_id: null },
        { gimmick_id: 32, x: 0, y: 0, actions: [{ gimmick_id: 32, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 32, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1009, zone: 9, floor: 6, orix: 1, oriy: 1,
      name: 'IX', map: 'angel9',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 33, x: 0, y: 0, actions: [{ gimmick_id: 33, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 33, status: 0 } ], key_id: null },
        { gimmick_id: 33, x: 0, y: 0, actions: [{ gimmick_id: 33, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 33, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1010, zone: 9, floor: 6, orix: 2, oriy: 1,
      name: 'X', map: 'angel10',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 34, x: 0, y: 0, actions: [{ gimmick_id: 34, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 34, status: 0 } ], key_id: null },
        { gimmick_id: 34, x: 0, y: 0, actions: [{ gimmick_id: 34, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 34, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1011, zone: 9, floor: 6, orix: 3, oriy: 1,
      name: 'XI', map: 'angel11',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 35, x: 0, y: 0, actions: [{ gimmick_id: 35, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 35, status: 0 } ], key_id: null },
        { gimmick_id: 35, x: 0, y: 0, actions: [{ gimmick_id: 35, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 35, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1012, zone: 9, floor: 6, orix: 4, oriy: 1,
      name: 'XII', map: 'angel12',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 36, x: 0, y: 0, actions: [{ gimmick_id: 36, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 36, status: 0 } ], key_id: null },
        { gimmick_id: 36, x: 0, y: 0, actions: [{ gimmick_id: 36, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 36, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1013, zone: 9, floor: 6, orix: 5, oriy: 1,
      name: 'XIII', map: 'angel13',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 37, x: 0, y: 0, actions: [{ gimmick_id: 37, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 37, status: 0 } ], key_id: null },
        { gimmick_id: 37, x: 0, y: 0, actions: [{ gimmick_id: 37, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 37, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1014, zone: 9, floor: 6, orix: 6, oriy: 1,
      name: 'XIV', map: 'angel14',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 38, x: 0, y: 0, actions: [{ gimmick_id: 38, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 38, status: 0 } ], key_id: null },
        { gimmick_id: 38, x: 0, y: 0, actions: [{ gimmick_id: 38, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 38, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1015, zone: 9, floor: 6, orix: 0, oriy: 2,
      name: 'XV', map: 'angel15',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 39, x: 0, y: 0, actions: [{ gimmick_id: 39, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 39, status: 0 } ], key_id: null },
        { gimmick_id: 39, x: 0, y: 0, actions: [{ gimmick_id: 39, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 39, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1016, zone: 9, floor: 6, orix: 1, oriy: 2,
      name: 'XVI', map: 'angel16',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 40, x: 0, y: 0, actions: [{ gimmick_id: 40, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 40, status: 0 } ], key_id: null },
        { gimmick_id: 40, x: 0, y: 0, actions: [{ gimmick_id: 40, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 40, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1017, zone: 9, floor: 6, orix: 2, oriy: 2,
      name: 'XVII', map: 'angel17',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 41, x: 0, y: 0, actions: [{ gimmick_id: 41, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 41, status: 0 } ], key_id: null },
        { gimmick_id: 41, x: 0, y: 0, actions: [{ gimmick_id: 41, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 41, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1018, zone: 9, floor: 6, orix: 3, oriy: 2,
      name: 'XVIII', map: 'angel18',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 42, x: 0, y: 0, actions: [{ gimmick_id: 42, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 42, status: 0 } ], key_id: null },
        { gimmick_id: 42, x: 0, y: 0, actions: [{ gimmick_id: 42, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 42, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1019, zone: 9, floor: 6, orix: 4, oriy: 2,
      name: 'XIX', map: 'angel19',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 43, x: 0, y: 0, actions: [{ gimmick_id: 43, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 43, status: 0 } ], key_id: null },
        { gimmick_id: 43, x: 0, y: 0, actions: [{ gimmick_id: 43, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 43, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1020, zone: 9, floor: 6, orix: 5, oriy: 2,
      name: 'XX', map: 'angel20',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 44, x: 0, y: 0, actions: [{ gimmick_id: 44, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 44, status: 0 } ], key_id: null },
        { gimmick_id: 44, x: 0, y: 0, actions: [{ gimmick_id: 44, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 44, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1021, zone: 9, floor: 6, orix: 6, oriy: 2,
      name: 'XXI', map: 'angel21',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 45, x: 0, y: 0, actions: [{ gimmick_id: 45, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 45, status: 0 } ], key_id: null },
        { gimmick_id: 45, x: 0, y: 0, actions: [{ gimmick_id: 45, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 45, status: 1 } ], key_id: 1 }
      ]
    },
    {
      id: 1022, zone: 9, floor: 6, orix: 7, oriy: 2,
      name: 'XXII', map: 'angel22',
      x: 0, y: 0, width: 60, height: 60,
      gimmicks: [
        { gimmick_id: 46, x: 0, y: 0, actions: [{ gimmick_id: 46, add: 1, desc: '' }], keyGain: null, require: [ { gimmick_id: 46, status: 0 } ], key_id: null },
        { gimmick_id: 46, x: 0, y: 0, actions: [{ gimmick_id: 46, add: -1, desc: '' }], keyGain: null, require: [ { gimmick_id: 46, status: 1 } ], key_id: 1 }
      ]
    }
  ]
  portals: Portal[] = [
    { id: 1, room_id: 1, x: 30, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 2, room_id: 2, x: 25, y: 49, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 3, room_id: 2, x: 25, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 4, room_id: 2, x: 0, y: 35, require: 7, requireStatus: 1, sk: null, desc: '<b>南①1F</b>へは、南①1Fのレバーを操作する必要がある。' },
    { id: 5, room_id: 2, x: 49, y: 35, require: 92, requireStatus: 1, sk: null, desc: '<b>南②1F</b>へは、南②1Fのレバーを操作する必要がある。' },
    { id: 6, room_id: 3, x: 50, y: 68, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 7, room_id: 3, x: 5, y: 40, require: null, requireStatus: 0, sk: null, desc: ''      
    },
    {
      id: 8,
      room_id: 3,
      x: 16, y: 0, require: null, requireStatus: 0, sk: null, desc: ''
    },
    { id: 9, room_id: 3, x: 63, y: 40, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 10, room_id: 4, x: 69, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    {
      id: 11,
      room_id: 4,
      x: 25, y: 65, require: null, requireStatus: 0, sk: null, desc: ''
    },
    { id: 12, room_id: 4, x: 0, y: 61, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 13, room_id: 4, x: 6, y: 49, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 14, room_id: 4, x: 25, y: 38, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 15, room_id: 5, x: 15, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 16, room_id: 6, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 17, room_id: 7, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 18, room_id: 7, x: 5, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 19, room_id: 7, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 20, room_id: 8, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 21, room_id: 8, x: 5, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 22, room_id: 8, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 23, room_id: 9, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 24, room_id: 9, x: 13, y: 5, require: 9, requireStatus: 1, sk: null, desc: '<b>北①天文台</b>の鍵は西屋上にある。' },
    { id: 25, room_id: 10, x: 17, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 26, room_id: 27, x: 12, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 27, room_id: 28, x: 0, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 28, room_id: 28, x: 45, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 29, room_id: 11, x: 4, y: 13, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 30, room_id: 12, x: 3, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 31, room_id: 12, x: 12, y: 41, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 32, room_id: 13, x: 20, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 33, room_id: 13, x: 13, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 34, room_id: 13, x: 5, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 35, room_id: 14, x: 25, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 36, room_id: 29, x: 76, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 37, room_id: 29, x: 3, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 38, room_id: 30, x: 10, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 39, room_id: 30, x: 10, y: 46, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 40, room_id: 15, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 41, room_id: 15, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 42, room_id: 16, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 43, room_id: 16, x: 5, y: 45, require: 0, requireStatus: 1, sk: null, desc: '<b> 城壁2F02</b>へは、こちらからは通れない。' },
    { id: 44, room_id: 16, x: 3, y: 15, require: 6, requireStatus: 1, sk: null, desc: '<b>城壁2F03</b>へは、グローザ像に四怨将のアルカナを示す必要がある。' },
    { id: 45, room_id: 16, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 46, room_id: 17, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 47, room_id: 17, x: 5, y: 45, require: 8, requireStatus: 0, sk: null, desc: '<b>城壁3</b>へは、グローザ像にアルカナを示した後は通れない。' },
    { id: 48, room_id: 17, x: 3, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 49, room_id: 17, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 50, room_id: 18, x: 18, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 51, room_id: 31, x: 10, y: 2, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 52, room_id: 31, x: 25, y: 50, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 53, room_id: 32, x: 10, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 54, room_id: 32, x: 10, y: 70, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 55, room_id: 19, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 56, room_id: 20, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 57, room_id: 20, x: 45, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 58, room_id: 20, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 59, room_id: 20, x: 40, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 60, room_id: 21, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 61, room_id: 21, x: 45, y: 35, require: 8, requireStatus: 0, sk: null, desc: '<b>城壁通路01</b>へは、グローザ像にアルカナを示した後は通れない。' },
    { id: 62, room_id: 21, x: 40, y: 15, require: 8, requireStatus: 0, sk: null, desc: '<b>城壁通路03</b>へは、グローザ像にアルカナを示した後は通れない。' },
    { id: 63, room_id: 21, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 64, room_id: 22, x: 17, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 65, room_id: 33, x: 102, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 66, room_id: 33, x: 10, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 67, room_id: 34, x: 26, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 68, room_id: 34, x: 1, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 69, room_id: 23, x: 55, y: 45, require: 7, requireStatus: 1, sk: null, desc: '<b>城門①1F</b>へは、南①1Fのレバーを操作する必要がある。' },
    { id: 70, room_id: 23, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 71, room_id: 24, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 72, room_id: 24, x: 5, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 73, room_id: 24, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 74, room_id: 25, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 75, room_id: 25, x: 5, y: 45, require: 8, requireStatus: 0, sk: null, desc: '<b>城壁通路01</b>へは、グローザ像にアルカナを示した後は通れない。' },
    { id: 76, room_id: 25, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 77, room_id: 26, x: 20, y: 34, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 78, room_id: 26, x: 45, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 79, room_id: 36, x: 15, y: 60, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 80, room_id: 36, x: 39, y: 48, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 81, room_id: 35, x: 16, y: 32, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 82, room_id: 37, x: 30, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 83, room_id: 38, x: 13, y: 33, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 84, room_id: 38, x: 13, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 85, room_id: 39, x: 11, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 86, room_id: 39, x: 30, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 87, room_id: 40, x: 28, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 88, room_id: 40, x: 10, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 89, room_id: 41, x: 8, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 90, room_id: 40, x: 19, y: 32, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 166, room_id: 62, x: 0, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 91, room_id: 60, x: 13, y: 70, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 92, room_id: 43, x: 5, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 93, room_id: 61, x: 100, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 94, room_id: 44, x: 5, y: 45, require: 56, requireStatus: 1, sk: null, desc: '<b>塔・北東2F</b>の鍵は塔・北東2F屋上にある。' },
    { id: 95, room_id: 62, x: 40, y: 8, require: 55, requireStatus: 1, sk: null, desc: '<b>塔・北東3F</b>の鍵は塔・東3Fにある。' },
    { id: 96, room_id: 45, x: 5, y: 45, require: 55, requireStatus: 1, sk: null, desc: '<b>塔・北東3F</b>の鍵は塔・東3Fにある。' },
    { id: 97, room_id: 42, x: 5, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 98, room_id: 43, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 99, room_id: 43, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 100, room_id: 44, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 101, room_id: 44, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 102, room_id: 45, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 103, room_id: 45, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 104, room_id: 46, x: 12, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 105, room_id: 44, x: 13, y: 55, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 106, room_id: 63, x: 11, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 107, room_id: 45, x: 13, y: 55, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 108, room_id: 64, x: 10, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 109, room_id: 63, x: 11, y: 102, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 110, room_id: 48, x: 50, y: 14, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 111, room_id: 64, x: 10, y: 45, require: 96, requireStatus: 1, sk: null, desc: '<b>塔・東3F</b>の鍵は塔・南東B1Fにある。' },
    { id: 112, room_id: 49, x: 20, y: 10, require: 96, requireStatus: 1, sk: null, desc: '<b>塔・東3F</b>の鍵は塔・南東B1Fにある。' },
    { id: 113, room_id: 47, x: 25, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 114, room_id: 48, x: 20, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 115, room_id: 48, x: 5, y: 14, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 116, room_id: 65, x: 10, y: 1, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 117, room_id: 49, x: 5, y: 10, require: 54, requireStatus: 1, sk: null, desc: '<b>塔・東3F</b>の鍵は塔・南東B1Fにある。' },
    { id: 118, room_id: 66, x: 37, y: 0, require: 54, requireStatus: 1, sk: null, desc: '<b>塔・東3F</b>の鍵は塔・南東B1Fにある。' },
    { id: 119, room_id: 49, x: 13, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 120, room_id: 50, x: 14, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 121, room_id: 65, x: 10, y: 97, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 122, room_id: 53, x: 48, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 123, room_id: 66, x: 37, y: 71, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 124, room_id: 54, x: 45, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 125, room_id: 51, x: 1, y: -15, require: 94, requireStatus: 1, sk: null, desc: '<b>南東1F</b>へは、南②3Fで転移の封印を解除する必要がある。' },
    { id: 126, room_id: 51, x: 9, y: -15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 127, room_id: 51, x: 17, y: -15, require: 93, requireStatus: 1, sk: null, desc: '<b>南東3F</b>へは、南②1Fで転移の封印を解除する必要がある。' },
    { id: 128, room_id: 51, x: 25, y: -15, require: 70, requireStatus: 1, sk: null, desc: '<b>南東屋上</b>へは、南東1Fで転移の封印を解除する必要がある。' },
    { id: 129, room_id: 51, x: 33, y: -15, require: 95, requireStatus: 1, sk: null, desc: '<b>南②屋上</b>へは、南東屋上で転移の封印を解除する必要がある。' },
    { id: 130, room_id: 52, x: 39, y: 70, require: 71, requireStatus: 1, sk: null, desc: '<b>南東B1F</b>へは、南②屋上で転移の封印を解除する必要がある。' },
    { id: 131, room_id: 52, x: 47, y: 70, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 132, room_id: 52, x: 55, y: 70, require: 93, requireStatus: 1, sk: null, desc: '<b>南東3F</b>へは、南②1Fで転移の封印を解除する必要がある。' },
    { id: 133, room_id: 52, x: 63, y: 70, require: 70, requireStatus: 1, sk: null, desc: '<b>南東屋上</b>へは、南東1Fで転移の封印を解除する必要がある。' },
    { id: 134, room_id: 52, x: 71, y: 70, require: 95, requireStatus: 1, sk: null, desc: '<b>南②屋上</b>へは、南東屋上で転移の封印を解除する必要がある。' },
    { id: 135, room_id: 53, x: 32, y: 63, require: 71, requireStatus: 1, sk: null, desc: '<b>南東B1F</b>へは、南②屋上で転移の封印を解除する必要がある。' },
    { id: 136, room_id: 53, x: 40, y: 63, require: 94, requireStatus: 1, sk: null, desc: '<b>南東1F</b>へは、南②3Fで転移の封印を解除する必要がある。' },
    { id: 137, room_id: 53, x: 48, y: 63, require: 93, requireStatus: 1, sk: null, desc: '<b>南東3F</b>へは、南②1Fで転移の封印を解除する必要がある。' },
    { id: 138, room_id: 53, x: 56, y: 63, require: 70, requireStatus: 1, sk: null, desc: '<b>南東屋上</b>へは、南東1Fで転移の封印を解除する必要がある。' },
    { id: 139, room_id: 53, x: 64, y: 63, require: 95, requireStatus: 1, sk: null, desc: '<b>南②屋上</b>へは、南東屋上で転移の封印を解除する必要がある。' },
    { id: 140, room_id: 54, x: 29, y: 60, require: 71, requireStatus: 1, sk: null, desc: '<b>南東B1F</b>へは、南②屋上で転移の封印を解除する必要がある。' },
    { id: 141, room_id: 54, x: 37, y: 60, require: 94, requireStatus: 1, sk: null, desc: '<b>南東1F</b>へは、南②3Fで転移の封印を解除する必要がある。' },
    { id: 142, room_id: 54, x: 45, y: 60, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 143, room_id: 54, x: 53, y: 60, require: 70, requireStatus: 1, sk: null, desc: '<b>南東屋上</b>へは、南東1Fで転移の封印を解除する必要がある。' },
    { id: 144, room_id: 54, x: 61, y: 60, require: 95, requireStatus: 1, sk: null, desc: '<b>南②屋上</b>へは、南東屋上で転移の封印を解除する必要がある。' },
    { id: 145, room_id: 55, x: 19, y: 5, require: 71, requireStatus: 1, sk: null, desc: '<b>南東B1F</b>へは、南②屋上で転移の封印を解除する必要がある。' },
    { id: 146, room_id: 55, x: 19, y: 5, require: 94, requireStatus: 1, sk: null, desc: '<b>南東1F</b>へは、南②3Fで転移の封印を解除する必要がある。' },
    { id: 147, room_id: 55, x: 19, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 148, room_id: 55, x: 19, y: 5, require: 93, requireStatus: 1, sk: null, desc: '<b>南東3F</b>へは、南②1Fで転移の封印を解除する必要がある。' },
    { id: 149, room_id: 55, x: 19, y: 5, require: 95, requireStatus: 1, sk: null, desc: '<b>南②屋上</b>へは、南東屋上で転移の封印を解除する必要がある。' },
    { id: 150, room_id: 59, x: 30, y: 17, require: 71, requireStatus: 1, sk: null, desc: '<b>南東B1F</b>へは、南②屋上で転移の封印を解除する必要がある。' },
    { id: 151, room_id: 59, x: 30, y: 17, require: 94, requireStatus: 1, sk: null, desc: '<b>南東1F</b>へは、南②3Fで転移の封印を解除する必要がある。' },
    { id: 152, room_id: 59, x: 30, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 153, room_id: 59, x: 30, y: 17, require: 93, requireStatus: 1, sk: null, desc: '<b>南東3F</b>へは、南②1Fで転移の封印を解除する必要がある。' },
    { id: 154, room_id: 59, x: 30, y: 17, require: 70, requireStatus: 1, sk: null, desc: '<b>南東屋上</b>へは、南東1Fで転移の封印を解除する必要がある。' },
    { id: 155, room_id: 53, x: 45, y: 88, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 156, room_id: 67, x: 98, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 157, room_id: 54, x: 45, y: 86, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 158, room_id: 68, x: 26, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 159, room_id: 67, x: 0, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 160, room_id: 57, x: 35, y: 13, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 161, room_id: 68, x: 0, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 162, room_id: 58, x: 30, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 163, room_id: 56, x: 3, y: 27, require: 92, requireStatus: 1, sk: null, desc: '<b>城門①1F</b>へは、南②1Fのレバーを操作する必要がある。' },
    { id: 164, room_id: 56, x: 23, y: 39, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 165, room_id: 57, x: 15, y: 13, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 167, room_id: 69, x: 0, y: 53, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 168, room_id: 69, x: 145, y: 57, require: 91, requireStatus: 1, sk: null, desc: '<b>東1F</b>へは、南東3Fのレバーを操作する必要がある。' },
    { id: 169, room_id: 47, x: 32, y: 28, require: 91, requireStatus: 1, sk: null, desc: '<b>中庭（東）</b>へは、南東3Fのレバーを操作する必要がある。' },
    { id: 170, room_id: 69, x: 64, y: 88, require: 62, requireStatus: 1, sk: null, desc: '<b>ペコ舎</b>の鍵は兵舎2F武器庫にある。' },
    { id: 171, room_id: 70, x: 0, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 172, room_id: 69, x: 118.5, y: 118, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 173, room_id: 77, x: 0, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 174, room_id: 71, x: 14, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 175, room_id: 74, x: 5, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 176, room_id: 72, x: 17, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 177, room_id: 74, x: 30, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 178, room_id: 73, x: 48, y: 40, require: 60, requireStatus: 1, sk: null, desc: '<b>2F武器庫</b>の鍵は兵舎2F大部屋にある。' },
    { id: 179, room_id: 74, x: 48, y: 0, require: 60, requireStatus: 1, sk: null, desc: '<b>2F武器庫</b>の鍵は兵舎2F大部屋にある。' },
    { id: 180, room_id: 73, x: 48, y: 0, require: 61, requireStatus: 1, sk: null, desc: '<b>城壁2F06</b>の鍵は兵舎2F隊長室にある。' },
    { id: 181, room_id: 65, x: 0, y: 63, require: 61, requireStatus: 1, sk: null, desc: '<b>城壁2F06</b>の鍵は兵舎2F隊長室にある。' },
    { id: 182, room_id: 75, x: 14, y: 14, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 183, room_id: 77, x: 26, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 184, room_id: 76, x: 0, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 185, room_id: 77, x: 55, y: 12, require: 59, requireStatus: 1, sk: null, desc: '<b>1F武器庫</b>の鍵は兵舎1F部屋①にある。' },
    { id: 186, room_id: 74, x: 48, y: 25, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 187, room_id: 77, x: 81, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 188, room_id: 78, x: 15, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 189, room_id: 77, x: 27, y: 29, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 190, room_id: 79, x: 15, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 191, room_id: 77, x: 55, y: 29, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 192, room_id: 80, x: 15, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 193, room_id: 77, x: 81, y: 29, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 194, room_id: 81, x: 18, y: 70, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 195, room_id: 82, x: 20, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 196, room_id: 81, x: 6, y: 46, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 197, room_id: 81, x: 30, y: 46, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 198, room_id: 83, x: 10, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 199, room_id: 84, x: 5, y: 28, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 200, room_id: 81, x: 0, y: 6, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 201, room_id: 86, x: 86, y: 30, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 202, room_id: 84, x: 5, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 203, room_id: 86, x: 9, y: 24, require: null, requireStatus: 0, sk: 31, desc: '大会議室へは、VIT110以上が必要だ。' },
    { id: 204, room_id: 85, x: 6, y: 24, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 205, room_id: 87, x: 5, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 206, room_id: 86, x: 30, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 207, room_id: 88, x: 8, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 208, room_id: 86, x: 55, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 209, room_id: 88, x: 15, y: 15, require: null, requireStatus: 0, sk: 32, desc: '執務室へは、VIT130以上が必要だ。' },
    { id: 210, room_id: 89, x: 0, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 211, room_id: 88, x: 17, y: 60, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 212, room_id: 90, x: 0, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 213, room_id: 81, x: 36, y: 6, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 214, room_id: 91, x: 16, y: 91, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 215, room_id: 92, x: 20, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 216, room_id: 91, x: 21, y: 13, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 217, room_id: 91, x: 0, y: 83, require: 18, requireStatus: 1, sk: null, desc: '<b>鐘楼</b>の鍵は教会1F会議室にある。' },
    { id: 218, room_id: 96, x: 3, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 219, room_id: 96, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 220, room_id: 95, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 221, room_id: 95, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 222, room_id: 94, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 223, room_id: 94, x: 13, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 224, room_id: 93, x: 38, y: 43, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 225, room_id: 97, x: 5, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 226, room_id: 96, x: 55, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 227, room_id: 98, x: 70, y: 13, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 228, room_id: 97, x: 0, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 229, room_id: 98, x: 0, y: 13, require: 16, requireStatus: 1, sk: null, desc: '<b>カタコンベ</b>の鍵は教会2F大会議室にある。' },
    { id: 230, room_id: 99, x: 7, y: 30, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 231, room_id: 99, x: 18, y: 5, require: 69, requireStatus: 1, sk: null, desc: '<b>カタコンベ祭壇</b>へは、鐘楼屋上の鐘を鳴らす必要がある。' },
    { id: 232, room_id: 100, x: 0, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 233, room_id: 101, x: 5, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 234, room_id: 99, x: -3, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 235, room_id: 102, x: 175, y: 48, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 236, room_id: 101, x: 13, y: 6, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 237, room_id: 103, x: 28, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 238, room_id: 102, x: 0, y: 48, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 239, room_id: 102, x: 110, y: 36, require: 82, requireStatus: 1, sk: null, desc: '<b>墓①</b>へは、カタコンベ倉庫のレバーを操作する必要がある。' },
    { id: 240, room_id: 104, x: 20, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 241, room_id: 102, x: 95, y: 70, require: 82, requireStatus: 1, sk: null, desc: '<b>墓②</b>へは、カタコンベ倉庫のレバーを操作する必要がある。' },
    { id: 242, room_id: 105, x: 6, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 243, room_id: 102, x: 62, y: 60, require: 82, requireStatus: 1, sk: null, desc: '<b>墓③</b>へは、カタコンベ倉庫のレバーを操作する必要がある。' },
    { id: 244, room_id: 106, x: 0, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 245, room_id: 102, x: 75, y: 26, require: 82, requireStatus: 1, sk: null, desc: '<b>墓④</b>へは、カタコンベ倉庫のレバーを操作する必要がある。' },
    { id: 246, room_id: 107, x: 12, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 247, room_id: 102, x: 44, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 248, room_id: 108, x: -2, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 249, room_id: 108, x: 19, y: 15, require: 13, requireStatus: 1, sk: null, desc: '浮き橋を渡るには、片方の水門のみ開ける必要がある。' },
    { id: 250, room_id: 109, x: -2, y: 15, require: 13, requireStatus: 1, sk: null, desc: '浮き橋を渡るには、片方の水門のみ開ける必要がある。' },
    { id: 251, room_id: 109, x: 15, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 252, room_id: 110, x: 3, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 253, room_id: 91, x: 27, y: 0, require: 17, requireStatus: 1, sk: null, desc: '<b>神殿通路1F02</b>の鍵は教会2F執務室にある。' },
    { id: 254, room_id: 111, x: 4, y: 40, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 255, room_id: 111, x: 4, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 256, room_id: 112, x: 0, y: 95, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 257, room_id: 112, x: 5, y: 0, require: 83, requireStatus: 1, sk: null, desc: '<b>騎士の間</b>へは、祭殿に身を捧げる必要がある。' },
    { id: 258, room_id: 113, x: 18, y: 34, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 259, room_id: 112, x: 59, y: 0, require: 83, requireStatus: 1, sk: null, desc: '<b>王妃の間</b>へは、祭殿に身を捧げる必要がある。' },
    { id: 260, room_id: 114, x: 31, y: 48, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 261, room_id: 112, x: 32, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 262, room_id: 115, x: 40, y: 195, require: 84, requireStatus: 0, sk: null, desc: '<b>神殿大広間</b>へは、<b>戦車の化身</b>を倒すまで出られない。' },
    { id: 263, room_id: 115, x: 40, y: 1, require: 84, requireStatus: 0, sk: null, desc: '<b>神殿通路1F01</b>へは、<b>戦車の化身</b>を倒すまで出られない。' },
    { id: 264, room_id: 116, x: 4, y: 35, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 265, room_id: 126, x: 3, y: 24, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 266, room_id: 42, x: 32, y: 50, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 267, room_id: 126, x: 37, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 268, room_id: 125, x: 36, y: 55, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 269, room_id: 127, x: 52, y: 24, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 270, room_id: 125, x: 114, y: 133, require: 58, requireStatus: 1, sk: null, desc: '<b>拷問部屋</b>の鍵は監獄・看守部屋にある。' },
    { id: 271, room_id: 125, x: 22, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 272, room_id: 118, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 273, room_id: 125, x: 47, y: 30, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 274, room_id: 119, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 275, room_id: 125, x: 72, y: 55, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 276, room_id: 120, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 277, room_id: 125, x: 97, y: 80, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 278, room_id: 121, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 279, room_id: 125, x: 122, y: 105, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 280, room_id: 122, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 281, room_id: 125, x: 147, y: 130, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 282, room_id: 123, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 283, room_id: 125, x: 172, y: 155, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 284, room_id: 124, x: 4, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 285, room_id: 132, x: 19, y: 5, require: 13, requireStatus: 0, sk: null, desc: '<b>水路01</b>へは、両方の水門を閉じる必要がある。' },
    { id: 286, room_id: 129, x: 3, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 287, room_id: 128, x: 0, y: 25, require: 13, requireStatus: 0, sk: null, desc: '<b>水路01</b>へは、両方の水門を閉じる必要がある。' },
    { id: 288, room_id: 129, x: 107, y: 6, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 289, room_id: 128, x: 46, y: 26, require: 13, requireStatus: 0, sk: null, desc: '<b>噴水最深部</b>へは、両方の水門を閉じる必要がある。' },
    { id: 290, room_id: 130, x: 12, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 291, room_id: 128, x: 58, y: 19, require: 97, requireStatus: 0, sk: null, desc: '<b>水路03</b>へは、どちらかの水門を閉じる必要がある。' },
    { id: 292, room_id: 134, x: 2, y: 24, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 293, room_id: 128, x: 41, y: 0, require: 13, requireStatus: 0, sk: null, desc: '<b>水路02</b>へは、両方の水門を閉じる必要がある。' },
    { id: 294, room_id: 135, x: 5, y: 80, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 295, room_id: 128, x: 20, y: 6, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 296, room_id: 133, x: 18, y: 36, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 297, room_id: 130, x: 19, y: 19, require: 19, requireStatus: 1, sk: null, desc: '<b>財の間</b>の鍵は祈りの間にある。' },
    { id: 298, room_id: 131, x: 30.5, y: 56, require: 13, requireStatus: 0, sk: null, desc: '<b>噴水最深部</b>へは、両方の水門を閉じる必要がある。' },
    { id: 299, room_id: 136, x: 28, y: 9.5, require: 13, requireStatus: 0, sk: null, desc: '<b>水路02</b>へは、両方の水門を閉じる必要がある。' },
    { id: 300, room_id: 135, x: 7, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 301, room_id: 136, x: 8, y: 9.5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 302, room_id: 137, x: 45, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 303, room_id: 134, x: 84, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 304, room_id: 139, x: 5, y: 19, require: 97, requireStatus: 0, sk: null, desc: '<b>水路03</b>へは、どちらかの水門を閉じる必要がある。' },
    { id: 305, room_id: 134, x: 45.5, y: 22, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 306, room_id: 138, x: 34, y: 4, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 307, room_id: 139, x: 12, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 308, room_id: 140, x: 25, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 309, room_id: 138, x: 3, y: 51, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 310, room_id: 37, x: 0, y: 22, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 311, room_id: 140, x: 10, y: 27, require: 73, requireStatus: 1, sk: null, desc: '<b>裏庭</b>の鍵は城壁2F08にある。' },
    { id: 312, room_id: 60, x: 15, y: 3, require: 73, requireStatus: 1, sk: null, desc: '<b>裏庭</b>の鍵は城壁2F08にある。' },
    { id: 313, room_id: 147, x: 18, y: 80, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 314, room_id: 132, x: 12, y: 12, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 315, room_id: 147, x: 9.5, y: 25, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 316, room_id: 148, x: 10, y: 50, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 317, room_id: 148, x: 10, y: 0, require: 66, requireStatus: 1, sk: null, desc: '<b>エントランス</b>へは、STR170以上の力をもって扉をぶち破る必要がある。' },
    { id: 318, room_id: 149, x: 56.5, y: 67, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 319, room_id: 149, x: 15, y: 58, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 320, room_id: 150, x: 19, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 321, room_id: 149, x: 92, y: 58, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 322, room_id: 151, x: 13, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 323, room_id: 149, x: 82, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 324, room_id: 153, x: 0, y: 20, require:  null, requireStatus: 0, sk: null, desc: '' },
    { id: 325, room_id: 153, x: 70, y: 20.5, require: 24, requireStatus: 1, sk: null, desc: '<b>貴賓室</b>の鍵は城内2F執務室にある。' },
    { id: 326, room_id: 154, x: 28, y: 13.5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 327, room_id: 149, x: 5, y: 0, require: 20, requireStatus: 1, sk: null, desc: '<b>エントランス</b>の鍵は城門②2Fにある。' },
    { id: 328, room_id: 152, x: 16, y: 20, require: 20, requireStatus: 1, sk: null, desc: '<b>エントランス</b>の鍵は城門②2Fにある。' },
    { id: 329, room_id: 149, x: 46.5, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 330, room_id: 160, x: -1, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 331, room_id: 155, x: 55, y: 121, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 332, room_id: 152, x: 30, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 333, room_id: 155, x: 0, y: 79, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 334, room_id: 156, x: 27, y: 4, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 335, room_id: 155, x: 0, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 336, room_id: 157, x: 25, y: 13.5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 337, room_id: 155, x: 110, y: 79, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 338, room_id: 158, x: 0, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 339, room_id: 155, x: 110, y: 45, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 340, room_id: 159, x: 5, y: 34, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 341, room_id: 133, x: 27, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 342, room_id: 159, x: 40.5, y: 15, require: 0, requireStatus: 1, sk: null, desc: '<b> 秘密の庭</b>へは、こちらからは通れない。' },
    { id: 343, room_id: 160, x: 35, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 344, room_id: 161, x: 20, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 345, room_id: 160, x: 40, y: 10, require: 65, requireStatus: 1, sk: 29, desc: '<b>バルコニー②</b>へは、所持重量を2000以下にする必要がある。<br/>この制限は城内2F図書室で解除できる。' },
    { id: 346, room_id: 162, x: 0, y: 7, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 347, room_id: 162, x: 15, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 348, room_id: 163, x: 30, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 349, room_id: 162, x: 15, y: 40, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 350, room_id: 164, x: 0, y: 15, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 351, room_id: 162, x: 0, y: 50, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 352, room_id: 165, x: 40, y: 9, require: 65, requireStatus: 1, sk: 29, desc: '<b>バルコニー②</b>へは、所持重量を2000以下にする必要がある。<br/>この制限は城内2F図書室で解除できる。' },
    { id: 353, room_id: 165, x: 31, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 354, room_id: 171, x: 64, y: 42, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 355, room_id: 165, x: 3, y: 11.5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 356, room_id: 166, x: 0, y: 36, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 357, room_id: 166, x: 0, y: 52, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 358, room_id: 167, x: 7, y: 19, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 359, room_id: 166, x: 50, y: 54, require: 88, requireStatus: 1, sk: null, desc: '<b>会議室</b>へは、円卓の間の騎士像を左へ動かす必要がある。' },
    { id: 360, room_id: 168, x: 20, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 361, room_id: 166, x: 0, y: 20, require: 87, requireStatus: 1, sk: null, desc: '<b>円卓の間</b>へは、石を合計1000個持ってくる必要がある。<br/>※ここでは重量制限解除後の1往復で運べるものとします' },
    { id: 362, room_id: 169, x: 28, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 363, room_id: 166, x: 50, y: 18, require: 88, requireStatus: 1, sk: null, desc: '<b>執務室</b>へは、円卓の間の騎士像を左へ動かす必要がある。' },
    { id: 364, room_id: 170, x: 13, y: 2, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 365, room_id: 170, x: 3, y: 32, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 366, room_id: 171, x: 83, y: 33, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 367, room_id: 171, x: 0, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 368, room_id: 172, x: 26, y: 15.5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 369, room_id: 171, x: 12, y: 5, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 370, room_id: 173, x: 23, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 371, room_id: 171, x: 27, y: 32, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 372, room_id: 174, x: 26, y: 14, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 373, room_id: 171, x: 45, y: 32, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 374, room_id: 175, x: 26, y: 14, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 375, room_id: 171, x: 64, y: 0, require: 50, requireStatus: 1, sk: null, desc: '<b>大貴賓室</b>の鍵は城内1F貴賓室にある。' },
    { id: 376, room_id: 176, x: 40, y: 34, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 377, room_id: 171, x: 101, y: 32, require: 90, requireStatus: 1, sk: null, desc: '<b>城壁2F07</b>へは、東屋上のレバーを操作する必要がある。' },
    { id: 378, room_id: 63, x: 0, y: 33, require: 90, requireStatus: 1, sk: null, desc: '<b>城内通路2F01</b>へは、東屋上のレバーを操作する必要がある。' },
    { id: 379, room_id: 171, x: 116, y: 5, require: 53, requireStatus: 1, sk: null, desc: '<b>城内通路2F03</b>の鍵は城内3F小礼拝堂にある。' },
    { id: 380, room_id: 195, x: 30, y: 10, require: 53, requireStatus: 1, sk: null, desc: '<b>城内通路2F03</b>の鍵は城内3F小礼拝堂にある。' },
    { id: 381, room_id: 171, x: 126, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 382, room_id: 177, x: 0, y: 11, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 383, room_id: 177, x: 11, y: 16, require: 51, requireStatus: 1, sk: null, desc: '<b>城内通路3F01</b>の鍵は城内2F医務室にある。' },
    { id: 384, room_id: 178, x: 14.5, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 385, room_id: 178, x: 30, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 386, room_id: 179, x: 0, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 387, room_id: 179, x: 3.5, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 388, room_id: 181, x: 2, y: 4, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 389, room_id: 181, x: 20, y: 4, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 390, room_id: 182, x: 15, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 391, room_id: 181, x: 20, y: 28, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 392, room_id: 183, x: 9, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 393, room_id: 181, x: 20, y: 52, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 394, room_id: 184, x: 0, y: 11, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 395, room_id: 181, x: 20, y: 76, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 396, room_id: 185, x: 3, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 397, room_id: 185, x: 3, y: 28, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 398, room_id: 186, x: 5, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 399, room_id: 181, x: 0, y: 76, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 400, room_id: 187, x: 18, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 401, room_id: 179, x: 32, y: 0, require: 52, requireStatus: 1, sk: null, desc: '<b>小礼拝堂</b>の鍵は城内3F王の寝室にある。' },
    { id: 402, room_id: 180, x: 7.5, y: 18, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 403, room_id: 179, x: 60, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 404, room_id: 188, x: 19, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 405, room_id: 188, x: 0, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 406, room_id: 189, x: 19, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 407, room_id: 188, x: 0, y: 27, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 408, room_id: 190, x: 19, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 409, room_id: 188, x: 0, y: 51, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 410, room_id: 191, x: 19, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 411, room_id: 188, x: 0, y: 75, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 412, room_id: 192, x: 15, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 413, room_id: 188, x: 23, y: 75, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 414, room_id: 193, x: 15.5, y: 42, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 415, room_id: 193, x: 38, y: 20, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 416, room_id: 194, x: 13, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 417, room_id: 195, x: -1, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 418, room_id: 39, x: 20.5, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 419, room_id: 195, x: 14, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 420, room_id: 116, x: 0, y: 17, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 421, room_id: 116, x: 4, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 422, room_id: 117, x: 52, y: 73, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 423, room_id: 117, x: 52, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 424, room_id: 196, x: 16, y: 36, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 425, room_id: 196, x: 16, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 426, room_id: 197, x: 16, y: 33, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 427, room_id: 197, x: 16, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 428, room_id: 198, x: 12, y: 28, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 429, room_id: 198, x: 25, y: 21, require: 3, requireStatus: 1, sk: null, desc: '<b>地下宝物庫の鍵</b>は北西1Fにある。' },
    { id: 430, room_id: 199, x: 10, y: 50, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 431, room_id: 69, x: 60, y: 19, require: 98, requireStatus: 1, sk: null, desc: '<b>使用人居住区の鍵</b>は使用人部屋①にある。' },
    { id: 432, room_id: 141, x: 12, y: 55, require: 98, requireStatus: 1, sk: null, desc: '<b>使用人居住区の鍵</b>は使用人部屋①にある。' },
    { id: 433, room_id: 141, x: 2, y: 41, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 434, room_id: 142, x: 18, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 435, room_id: 141, x: 2, y: 23, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 436, room_id: 143, x: 19, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 437, room_id: 141, x: 29, y: 10, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 438, room_id: 144, x: 25, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 439, room_id: 141, x: 12, y: 3, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 440, room_id: 145, x: 38, y: 26, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 441, room_id: 145, x: 3, y: 16, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 442, room_id: 146, x: 7, y: 24, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 443, room_id: 146, x: 30, y: 21, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 444, room_id: 140, x: 15, y: 8, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 445, room_id: 146, x: 11, y: 0, require: null, requireStatus: 0, sk: null, desc: '' },
    { id: 446, room_id: 159, x: 70, y: 4, require: null, requireStatus: 0, sk: null, desc: '' }
  ]
  connections: Connection[] = [
    { from: 1, to: 2 }, { from: 3, to: 6 },
    { from: 7, to: 10 }, { from: 14, to: 15 },
    { from: 16, to: 17 }, { from: 19, to: 20 }, { from: 22, to: 23 }, { from: 24, to: 25 },
    { from: 18, to: 26 }, { from: 21, to: 27 }, { from: 28, to: 32 },
    { from: 29, to: 30 }, { from: 33, to: 35 },
    { from: 31, to: 37 }, { from: 34, to: 38 }, { from: 36, to: 44 }, { from: 39, to: 48 },
    { from: 12, to: 40 }, { from: 41, to: 42 }, { from: 45, to: 46 }, { from: 49, to: 50 },
    { from: 43, to: 51 }, { from: 47, to: 53 }, { from: 52, to: 57 }, { from: 54, to: 62 },
    { from: 55, to: 56 }, { from: 58, to: 60 }, { from: 63, to: 64 },
    { from: 59, to: 66 }, { from: 65, to: 72 }, { from: 61, to: 68 }, { from: 67, to: 75 },
    { from: 4, to: 69 }, { from: 70, to: 71 }, { from: 73, to: 74 }, { from: 76, to: 77 },
    { from: 78, to: 79 }, { from: 80, to: 81 },
    { from: 82, to: 83 }, { from: 84, to: 85 }, { from: 86, to: 87 }, { from: 88, to: 89 }, 
    { from: 90, to: 166 }, { from: 91, to: 92 }, { from: 93, to: 94 }, { from: 95, to: 96 }, { from: 97, to: 98 }, 
    { from: 99, to: 100 }, { from: 101, to: 102 }, { from: 103, to: 104 }, { from: 105, to: 106 }, { from: 107, to: 108 }, 
    { from: 109, to: 110 }, { from: 111, to: 112 }, { from: 113, to: 114 }, { from: 115, to: 116 }, { from: 117, to: 118 }, 
    { from: 119, to: 120 }, { from: 121, to: 122 }, { from: 123, to: 124 }, { from: 125, to: 130 }, { from: 126, to: 135 }, 
    { from: 127, to: 140 }, { from: 128, to: 145 }, { from: 129, to: 150 }, { from: 131, to: 136 }, { from: 132, to: 141 }, 
    { from: 133, to: 146 }, { from: 134, to: 151 }, { from: 137, to: 142 }, { from: 138, to: 147 }, { from: 139, to: 152 }, 
    { from: 143, to: 148 }, { from: 144, to: 153 }, { from: 149, to: 154 }, { from: 155, to: 156 }, { from: 157, to: 158 }, 
    { from: 159, to: 160 }, { from: 161, to: 162 }, { from: 5, to: 163 }, { from: 164, to: 165 }, { from: 168, to: 169 }, { from: 9, to: 167 },
    { from: 170, to: 171 }, { from: 172, to: 173 }, { from: 174, to: 175 }, { from: 176, to: 177 }, { from: 178, to: 179 }, 
    { from: 180, to: 181 }, { from: 182, to: 183 }, { from: 184, to: 185 }, { from: 186, to: 187 }, { from: 188, to: 189 }, 
    { from: 190, to: 191 }, { from: 192, to: 193 }, { from: 13, to: 194 }, { from: 195, to: 196 }, { from: 197, to: 198 },
    { from: 199, to: 200 }, { from: 201, to: 202 }, { from: 203, to: 204 }, { from: 205, to: 206 }, { from: 207, to: 208 },
    { from: 209, to: 210 }, { from: 211, to: 212 }, { from: 213, to: 214 }, { from: 215, to: 216 }, { from: 217, to: 218 },
    { from: 219, to: 220 }, { from: 221, to: 222 }, { from: 223, to: 224 }, { from: 225, to: 226 }, { from: 227, to: 228 },
    { from: 229, to: 230 }, { from: 231, to: 232 }, { from: 233, to: 234 }, { from: 235, to: 236 }, { from: 237, to: 238 },
    { from: 239, to: 240 }, { from: 241, to: 242 }, { from: 243, to: 244 }, { from: 245, to: 246 }, { from: 247, to: 248 },
    { from: 249, to: 250 }, { from: 251, to: 252 }, { from: 253, to: 254 }, { from: 255, to: 256 }, { from: 257, to: 258 },
    { from: 259, to: 260 }, { from: 261, to: 262 }, { from: 263, to: 264 }, { from: 265, to: 266 }, { from: 267, to: 268 },
    { from: 269, to: 270 }, { from: 271, to: 272 }, { from: 273, to: 274 }, { from: 275, to: 276 }, { from: 277, to: 278 },
    { from: 279, to: 280 }, { from: 281, to: 282 }, { from: 283, to: 284 }, { from: 285, to: 286 }, { from: 287, to: 288 },
    { from: 289, to: 290 }, { from: 291, to: 292 }, { from: 293, to: 294 }, { from: 295, to: 296 }, { from: 297, to: 298 },
    { from: 299, to: 300 }, { from: 301, to: 302 }, { from: 303, to: 304 }, { from: 305, to: 306 }, { from: 307, to: 308 },
    { from: 309, to: 310 }, { from: 311, to: 312 }, { from: 8, to: 313 }, { from: 11, to: 314 }, { from: 315, to: 316 }, { from: 317, to: 318 },
    { from: 319, to: 320 }, { from: 321, to: 322 }, { from: 323, to: 324 }, { from: 325, to: 326 }, { from: 327, to: 328 },
    { from: 329, to: 330 }, { from: 331, to: 332 }, { from: 333, to: 334 }, { from: 335, to: 336 }, { from: 337, to: 338 },
    { from: 339, to: 340 }, { from: 341, to: 342 }, { from: 343, to: 344 }, { from: 345, to: 346 }, { from: 347, to: 348 },
    { from: 349, to: 350 }, { from: 351, to: 352 }, { from: 353, to: 354 }, { from: 355, to: 356 }, { from: 357, to: 358 },
    { from: 359, to: 360 }, { from: 361, to: 362 }, { from: 363, to: 364 }, { from: 365, to: 366 }, { from: 367, to: 368 },
    { from: 369, to: 370 }, { from: 371, to: 372 }, { from: 373, to: 374 }, { from: 375, to: 376 }, { from: 377, to: 378 },
    { from: 379, to: 380 }, { from: 381, to: 382 }, { from: 383, to: 384 }, { from: 385, to: 386 }, { from: 387, to: 388 },
    { from: 389, to: 390 }, { from: 391, to: 392 }, { from: 393, to: 394 }, { from: 395, to: 396 }, { from: 397, to: 398 },
    { from: 399, to: 400 }, { from: 401, to: 402 }, { from: 403, to: 404 }, { from: 405, to: 406 }, { from: 407, to: 408 },
    { from: 409, to: 410 }, { from: 411, to: 412 }, { from: 413, to: 414 }, { from: 415, to: 416 }, { from: 417, to: 418 },
    { from: 419, to: 420 }, { from: 421, to: 422 }, { from: 423, to: 424 }, { from: 425, to: 426 }, { from: 427, to: 428 },
    { from: 429, to: 430 }, { from: 421, to: 422 }, { from: 423, to: 424 }, { from: 425, to: 426 }, { from: 427, to: 428 },
    { from: 429, to: 430 }, { from: 431, to: 432 }, { from: 433, to: 434 }, { from: 435, to: 436 }, { from: 437, to: 438 },
    { from: 439, to: 440 }, { from: 441, to: 442 }, { from: 443, to: 444 }, { from: 445, to: 446 }
  ]
  gimmicks: Gimmick[] = [
    {
      id: 0,
      name: '<span style="color: blue; font-weight: bold;">一歩通行</span>',
      status: 0,
      desc: '一方通行全般に使用する。'
    },
    {
      id: 1,
      name: '<span style="color: blue; font-weight: bold;">グローザ像の起動</span>',
      status: 0,
      desc: '「9603」を入力し、四怨将の像を目覚めさせる。'
    },
    {
      id: 2,
      name: '<span style="color: blue; font-weight: bold;">デヒョン像</span>',
      status: 0,
      desc: 'グローザ像を起動すると、示すアルカナが確認できるようになる。'
    },
    {
      id: 3,
      name: '<span style="color: blue; font-weight: bold;">ヒュリエル像</span>',
      status: 0,
      desc: 'グローザ像を起動すると、示すアルカナが確認できるようになる。'
    },
    {
      id: 4,
      name: '<span style="color: blue; font-weight: bold;">ジオイア像</span>',
      status: 0,
      desc: 'グローザ像を起動すると、示すアルカナが確認できるようになる。'
    },
    {
      id: 5,
      name: '<span style="color: blue; font-weight: bold;">カデス像</span>',
      status: 0,
      desc: 'グローザ像を起動すると、示すアルカナが確認できるようになる。'
    },
    {
      id: 6,
      name: '<span style="color: blue; font-weight: bold;">四怨将のアルカナを示す</span>',
      status: 0,
      desc: 'グローザ像に四怨将のアルカナを示すと、西2Fから城壁2F03へ行けるようになる。'
    },
    {
      id: 7,
      name: '<span style="color: blue; font-weight: bold;">南①1Fのレバー</span>',
      status: 0,
      desc: '操作すると、城門①1F↔南①1F間のWPが現れる。'
    },
    {
      id: 8,
      name: '<span style="color: blue; font-weight: bold;">一時的に城壁通路が閉じられる</span>',
      status: 0,
      desc: 'グローザ像開放後は、城壁通路01と03を通らずに城壁2F03にたどり着く必要がある。'
    },
    {
      id: 9,
      name: '<span style="color: blue; font-weight: bold;">北①天文台の鍵</span>',
      status: 0,
      desc: '北①天文台の鍵は西屋上にある。'
    },
    {
      id: 10,
      name: '<span style="color: blue; font-weight: bold;">水門①開閉装置作動キー</span>',
      status: 0,
      desc: '水門①開閉装置作動キーは城壁2F04にある。'
    },
    {
      id: 11,
      name: '<span style="color: blue; font-weight: bold;">水門①</span>',
      status: 0,
      desc: '財の間の鍵や王家の花の入手のために操作する必要がある。'
    },
    {
      id: 12,
      name: '<span style="color: blue; font-weight: bold;">水門②</span>',
      status: 0,
      desc: '財の間の鍵や王家の花の入手のために操作する必要がある。'
    },
    {
      id: 13,
      name: '<span style="color: blue; font-weight: bold;">水量</span>',
      status: 0,
      desc: '2つの水門によって操作される水量。'
    },
    {
      id: 14,
      name: '<span style="color: blue; font-weight: bold;">地下宝物庫の鍵</span>',
      status: 0,
      desc: '地下宝物庫の鍵は北西1Fにある。'
    },
    {
      id: 15,
      name: '<span style="color: blue; font-weight: bold;">城壁2F01,02,03のトラップ</span>',
      status: 0,
      desc: '北西2Fのレバーを操作するとトラップが解除される。'
    },
    {
      id: 16,
      name: '<span style="color: blue; font-weight: bold;">カタコンベの鍵</span>',
      status: 0,
      desc: 'カタコンベの鍵は教会2F大会議室にある。'
    },
    {
      id: 17,
      name: '<span style="color: blue; font-weight: bold;">神殿通路1F02の鍵</span>',
      status: 0,
      desc: '神殿通路1F02の鍵は教会2F執務室にある。'
    },
    {
      id: 18,
      name: '<span style="color: blue; font-weight: bold;">鐘楼の鍵</span>',
      status: 0,
      desc: '鐘楼の鍵は教会1F会議室にある。'
    },
    {
      id: 19,
      name: '<span style="color: blue; font-weight: bold;">財の間の鍵</span>',
      status: 0,
      desc: '財の間の鍵は祈りの間にある。'
    },
    {
      id: 20,
      name: '<span style="color: blue; font-weight: bold;">エントランスの鍵</span>',
      status: 0,
      desc: 'エントランスの鍵は城門②2Fにある。'
    },
    {
      id: 21,
      name: '<span style="color: blue; font-weight: bold;">赤の宝石</span>',
      status: 0,
      desc: '城内2Fヴンダーカンマーにある赤の宝石を、城内1F小ホール②に持っていく。'
    },
    {
      id: 22,
      name: '<span style="color: blue; font-weight: bold;">緑の宝石</span>',
      status: 0,
      desc: '城内2Fヴンダーカンマーにある緑の宝石を、城内1F小ホール①に持っていく。'
    },
    {
      id: 23,
      name: '<span style="color: blue; font-weight: bold;">黒の宝石</span>',
      status: 0,
      desc: '城内2Fヴンダーカンマーにある黒の宝石を、城内1F中ホールに持っていく。'
    },
    {
      id: 24,
      name: '<span style="color: blue; font-weight: bold;">貴賓室の鍵</span>',
      status: 0,
      desc: '貴賓室の鍵は城内2F執務室にある。'
    },
    {
      id: 25,
      name: '<span style="color: blue; font-weight: bold;">第1の守護天使 魔術師の化身ルシフェル</span>',
      status: 0,
      desc: 'こいつ、ジラントの手下だったのか？<br/>強さもあのルキフルだが、夢幻の迷宮でフラグを立てたリーダーが探索を始めると弱体化する。<br/>HP20%でダークブレッシング（HP1化）を使う。<br/>守護天使の中で唯一の人間種族（他は全て天使）。'
    },
    {
      id: 26,
      name: '<span style="color: blue; font-weight: bold;">第2の守護天使 女教皇の化身フルーレティ</span>',
      status: 0,
      desc: '脳筋。ブレイクアーマーを持つらしい。'
    },
    {
      id: 27,
      name: '<span style="color: blue; font-weight: bold;">第3の守護天使 女帝の化身アスタロト</span>',
      status: 0,
      desc: 'FLEEが非常に高く、無策だと死ぬ威力のウォーターボールを使う。'
    },
    {
      id: 28,
      name: '<span style="color: blue; font-weight: bold;">第4の守護天使 皇帝の化身マルキダエル</span>',
      status: 0,
      desc: '石化に闇攻撃を絡めたり、ラッシュアタックとアジリティアップを両方使うっぽいなどポテンシャルが高い。<br/>Atkにもムラがあるようで「前は楽勝だったのに今度は全然勝てない」という事がよくある。<br/>一方でアンクルスネアに弱く、レンジャーが鐘楼の鐘を鳴らしたついでに倒すのは簡単。'
    },
    {
      id: 29,
      name: '<span style="color: blue; font-weight: bold;">第5の守護天使 法王の化身アスモデル</span>',
      status: 0,
      desc: 'Atkが高く、たまにダークブレッシング（HP1化）を使うらしい。DEFも高いと思われる。'
    },
    {
      id: 30,
      name: '<span style="color: blue; font-weight: bold;">第6の守護天使 恋人の化身アムブリエル</span>',
      status: 0,
      desc: 'ウォーターボールとセルフディストラクションを使う。<br/>狭い場所で射程3なので間合いが取りづらく、残HPが多い状態でも自爆することがある。<br/>周辺の他の部屋を先に終わらせておけば事故った時のロスを抑えられる。'
    },
    {
      id: 31,
      name: '<span style="color: blue; font-weight: bold;">第7の守護天使 戦車の化身ムリエル</span>',
      status: 0,
      desc: 'FLEEが非常に高く、無策だと即死する威力のメテオストームとヘルジャッジメントを使う。<br/>座っているくせに素早く動き回る。'
    },
    {
      id: 32,
      name: '<span style="color: blue; font-weight: bold;">第8の守護天使 力の化身ウェルキエル</span>',
      status: 0,
      desc: '攻撃力が高く、抱えるとけっこう痛い。FLEEも割とある。<br/>前座が回廊の敵なのに、ディフェンダーを使ったり闇3だったりで遠距離や魔法に耐性があるのがいやらしい。'
    },
    {
      id: 33,
      name: '<span style="color: blue; font-weight: bold;">第9の守護天使 隠者の化身ハマリエル</span>',
      status: 0,
      desc: 'FLEEが非常に高い。<br/>フロストダイバーにダークブレスを絡めてくるので不死鎧か闇アンフロが無難か。'
    },
    {
      id: 34,
      name: '<span style="color: blue; font-weight: bold;">第10の守護天使 運命の輪の化身アガリアレプト</span>',
      status: 0,
      desc: 'FLEEが高く、遠距離に対してはニューマ、魔法に対してはマジックミラーとスキが少ない。<br/>攻撃スキルも豊富な完璧に近い男。'
    },
    {
      id: 35,
      name: '<span style="color: blue; font-weight: bold;">第11の守護天使 正義の化身ズリエル</span>',
      status: 0,
      desc: '風、聖の強い攻撃とアースクエイクを使う。<br/>HP30%を切るとパワーアップ系スキルを使用するが、その間が一番のスキでもある。最初のFLEEは低め。'
    },
    {
      id: 36,
      name: '<span style="color: blue; font-weight: bold;">第12の守護天使 吊るされた男の化身ネビロス</span>',
      status: 0,
      desc: '複数の水属性魔法とディスペル、範囲凍結を使う。噛まれると痛いが足は遅い。'
    },
    {
      id: 37,
      name: '<span style="color: blue; font-weight: bold;">第13の守護天使 死神の化身バルビエル</span>',
      status: 0,
      desc: 'ブレイクアーマーに加え、HPを減らすとスパイラルピアース、ラッシュアタック、ツーハンドクイッケンを使う。<br/>それなりの火力とスパイラルピアースで即死しない耐久が欲しい。'
    },
    {
      id: 38,
      name: '<span style="color: blue; font-weight: bold;">第14の守護天使 節制の化身アドナキエル</span>',
      status: 0,
      desc: '各種ワイド状態異常スキルとソウルドレインによる妨害と、ウォーターボール、アースクエイクを使う。<br/>グダると強く感じるが、使用スキルの種類が多い一方でASPDは速くないのでさっさと倒せば大したダメージは受けない。<br/>FLEEが低くダメージは与えやすい。'
    },
    {
      id: 39,
      name: '<span style="color: blue; font-weight: bold;">第15の守護天使 悪魔の化身ハナエル</span>',
      status: 0,
      desc: '当たると痛いメテオストーム、ヘルジャッジメント、ブレイクヘルムを使う。<br/>ASPDは遅いのでセイフティウォールが有効。'
    },
    {
      id: 40,
      name: '<span style="color: blue; font-weight: bold;">第16の守護天使 塔の化身サタナキア</span>',
      status: 0,
      desc: '風、闇、無のそれなりに強い攻撃と、ブレイクアーマーを使う。<br/>アースクエイクも使うが、詠唱が3秒くらいある。'
    },
    {
      id: 41,
      name: '<span style="color: blue; font-weight: bold;">第17の守護天使 星の化身ガムビエル</span>',
      status: 0,
      desc: 'FLEEが高いらしい。<br/>ガンバンテインによってセイフティウォールが、<br/>マグナムブレイクとニューマとインデュアによってアンクルスネアが対策されており、時にかなり面倒くさく感じる。'
    },
    {
      id: 42,
      name: '<span style="color: blue; font-weight: bold;">第18の守護天使 月の化身バキエル</span>',
      status: 0,
      desc: 'フルストリップ、ディスペルを使う。ステータスは高くないらしい。'
    },
    {
      id: 43,
      name: '<span style="color: blue; font-weight: bold;">第19の守護天使 太陽の化身アイニ</span>',
      status: 0,
      desc: 'FLEEが高い。射程1のフルストリップ範囲に入らないように注意。<br/>HPが減ると使うアースクエイクは詠唱が超短い。遠距離でも使うので、惜しいところで負けると再会時にいきなり撃ってくるかも。'
    },
    {
      id: 44,
      name: '<span style="color: blue; font-weight: bold;">第20の守護天使 審判の化身サルガタナス</span>',
      status: 0,
      desc: '危険な威力のヘルジャッジメントを使う。ASPDは遅いのでセイフティウォールが有効。<br/>この図体でアジリティアップ持ち。幽霊だからか？'
    },
    {
      id: 45,
      name: '<span style="color: blue; font-weight: bold;">第21の守護天使 世界の化身サタン</span>',
      status: 0,
      desc: '火、闇のそこそこ強い攻撃と石化を使う。<br/>マジックミラー持ちなので魔法を撃つのは30秒待ってからにしよう。<br/>使用スキル的には強いはずだが、実際にはAtkもASPDもあまり高く感じない。'
    },
    {
      id: 46,
      name: '<span style="color: blue; font-weight: bold;">第22の守護天使 愚者の化身ルキフグス</span>',
      status: 0,
      desc: 'リフレクトシールドを使うが、全員でかかれるので苦労しないと思う。'
    },
    {
      id: 47,
      name: '<span style="color: blue; font-weight: bold;">魔獣ブロールホース</span>',
      status: 0,
      desc: '近接物理攻撃しか効かない馬。攻撃は天使ほどではないがけっこう痛い。<br/>祈りの間はめちゃくちゃ狭い上に物理攻撃が効きづらい旧市街地モンスターと一緒にいるから大変。'
    },
    {
      id: 48,
      name: '<span style="color: blue; font-weight: bold;">魔獣シューターデーモン</span>',
      status: 0,
      desc: '遠距離物理攻撃しか効かない鷲獅子。風4という属性も旧市街地モンスターと相性補完になっている。<br/>特別に広い視界を持ち、急にやってきて地味に痛いロードオブヴァーミリオンを撃つ。<br/>HPが減るとアジリティアップを使う。'
    },
    {
      id: 49,
      name: '<span style="color: blue; font-weight: bold;">魔獣マジックビースト</span>',
      status: 0,
      desc: '魔法攻撃しか効かない犬。ストームガストは直撃すると死ねる。<br/>なんと魔法反射持ちのホーリーエルダーと一緒にいる。<br/>聖4に通らない属性魔法なら誤射しても反射される心配はない。'
    },
    {
      id: 50,
      name: '<span style="color: blue; font-weight: bold;">大貴賓室の鍵</span>',
      status: 0,
      desc: '大貴賓室の鍵は城内1F貴賓室にある。'
    },
    {
      id: 51,
      name: '<span style="color: blue; font-weight: bold;">城内通路3F01の鍵</span>',
      status: 0,
      desc: '城内通路3F01の鍵は城内2F医務室にある。'
    },
    {
      id: 52,
      name: '<span style="color: blue; font-weight: bold;">小礼拝堂の鍵</span>',
      status: 0,
      desc: '小礼拝堂の鍵は城内3F王の寝室にある。'
    },
    {
      id: 53,
      name: '<span style="color: blue; font-weight: bold;">城内通路2F03の鍵</span>',
      status: 0,
      desc: '城内通路2F03の鍵は城内3F小礼拝堂にある。'
    },
    {
      id: 54,
      name: '<span style="color: blue; font-weight: bold;">塔・東3Fの鍵</span>',
      status: 0,
      desc: '塔・東3Fの鍵は塔・南東B1Fにある。'
    },
    {
      id: 55,
      name: '<span style="color: blue; font-weight: bold;">塔・北東3Fの鍵</span>',
      status: 0,
      desc: '塔・北東3Fの鍵は塔・東3Fにある。'
    },
    {
      id: 56,
      name: '<span style="color: blue; font-weight: bold;">塔・北東2Fの鍵</span>',
      status: 0,
      desc: '塔・北東2Fの鍵は塔・北東屋上にある。'
    },
    {
      id: 57,
      name: '<span style="color: blue; font-weight: bold;">水門②開閉装置作動キー</span>',
      status: 0,
      desc: '水門②開閉装置作動キーは塔・北②屋上にある。'
    },
    {
      id: 58,
      name: '<span style="color: blue; font-weight: bold;">拷問部屋の鍵</span>',
      status: 0,
      desc: '拷問部屋の鍵は監獄・看守部屋にある。'
    },
    {
      id: 59,
      name: '<span style="color: blue; font-weight: bold;">1F 武器庫の鍵</span>',
      status: 0,
      desc: '1F武器庫の鍵は兵舎1F 部屋①にある。'
    },
    {
      id: 60,
      name: '<span style="color: blue; font-weight: bold;">2F 武器庫の鍵</span>',
      status: 0,
      desc: '2F武器庫の鍵は兵舎2F 大部屋にある。'
    },
    {
      id: 61,
      name: '<span style="color: blue; font-weight: bold;">城壁2F 06の鍵</span>',
      status: 0,
      desc: '城壁2F06の鍵は兵舎2F 隊長室にある。'
    },
    {
      id: 62,
      name: '<span style="color: blue; font-weight: bold;">ペコ舎の鍵</span>',
      status: 0,
      desc: 'ペコ舎の鍵は兵舎2F 武器庫にある。'
    },
    {
      id: 63,
      name: '<span style="color: blue; font-weight: bold;">王家の花の種</span>',
      status: 0,
      desc: '王家の花の種は城内1F 墓地にある。'
    },
    {
      id: 64,
      name: '<span style="color: blue; font-weight: bold;">水を湛えたプランター</span>',
      status: 0,
      desc: '城内1F墓地にある王家の花の種を持っていくと、王家の花が手に入る。'
    },
    {
      id: 65,
      name: '<span style="color: blue; font-weight: bold;">所持重量2000以下</span>',
      status: 0,
      desc: 'バルコニーでは、所持重量2000以下の軽装がマナーらしい。物を落とすと危ないからか？'
    },
    {
      id: 66,
      name: '<span style="color: blue; font-weight: bold;">エントランスの扉</span>',
      status: 0,
      desc: '扉をぶち破るためには、STR170以上の力が必要らしい。'
    },
    {
      id: 67,
      name: '<span style="color: blue; font-weight: bold;">大会議室の入り口</span>',
      status: 0,
      desc: '電流のようなものが流れる入り口を通るためには、VIT110以上が必要らしい。'
    },
    {
      id: 68,
      name: '<span style="color: blue; font-weight: bold;">執務室の入り口</span>',
      status: 0,
      desc: '電流のようなものが流れる入り口を通るためには、VIT1f30以上が必要らしい。'
    },
    {
      id: 69,
      name: '<span style="color: blue; font-weight: bold;">釣鐘</span>',
      status: 0,
      desc: '釣鐘をうまく鳴らすためには、DEX220以上が必要らしい。'
    },
    {
      id: 70,
      name: '<span style="color: blue; font-weight: bold;">転移の封印（南東屋上）</span>',
      status: 0,
      desc: '南東屋上への転移の封印を解くためには、INT150以上が必要らしい。'
    },
    {
      id: 71,
      name: '<span style="color: blue; font-weight: bold;">転移の封印（南東B1F）</span>',
      status: 0,
      desc: '南東B1Fへの転移の封印を解くためには、INT170以上が必要らしい。'
    },
    {
      id: 72,
      name: '<span style="color: blue; font-weight: bold;">釣鐘の部品</span>',
      status: 0,
      desc: '鐘楼屋上に持っていこう。'
    },
    {
      id: 73,
      name: '<span style="color: blue; font-weight: bold;">裏庭の鍵</span>',
      status: 0,
      desc: '裏庭の鍵は城壁2F08にある。'
    },
    {
      id: 74,
      name: '<span style="color: blue; font-weight: bold;">未完成の釣鐘</span>',
      status: 0,
      desc: '鐘楼B1Fにある釣鐘の部品を4つ持っていくと、立派な釣鐘が完成する。'
    },
    {
      id: 75,
      name: '<span style="color: blue; font-weight: bold;">未完成の釣鐘</span>',
      status: 0,
      desc: '鐘楼B1Fにある釣鐘の部品を4つ持っていくと、立派な釣鐘が完成する。'
    },
    {
      id: 76,
      name: '<span style="color: blue; font-weight: bold;">未完成の釣鐘</span>',
      status: 0,
      desc: '鐘楼B1Fにある釣鐘の部品を4つ持っていくと、立派な釣鐘が完成する。'
    },
    {
      id: 77,
      name: '<span style="color: blue; font-weight: bold;">未完成の釣鐘</span>',
      status: 0,
      desc: '鐘楼B1Fにある釣鐘の部品を4つ持っていくと、立派な釣鐘が完成する。'
    },
    {
      id: 78,
      name: '<span style="color: blue; font-weight: bold;">封印された守護天使</span>',
      status: 0,
      desc: '封印を解く必要があるようだ。'
    },
    {
      id: 79,
      name: '<span style="color: blue; font-weight: bold;">墓①の封印</span>',
      status: 0,
      desc: 'DEXが減る呪いに加えて大量のフレイムソルジャーが発生する。'
    },
    {
      id: 80,
      name: '<span style="color: blue; font-weight: bold;">墓②の封印</span>',
      status: 0,
      desc: 'STRが減る呪いに加えて大量のフレイムソルジャーが発生する。'
    },
    {
      id: 81,
      name: '<span style="color: blue; font-weight: bold;">墓③の封印</span>',
      status: 0,
      desc: 'INTが減る呪いに加えて大量のフレイムソルジャーが発生する。'
    },
    {
      id: 82,
      name: '<span style="color: blue; font-weight: bold;">カタコンベ倉庫のレバー</span>',
      status: 0,
      desc: '操作すると、カタコンベ通路内の墓に入れるようになる。'
    },
    {
      id: 83,
      name: '<span style="color: blue; font-weight: bold;">祭殿の生贄</span>',
      status: 0,
      desc: 'LUK100以上の信仰厚い身を捧げる必要があるらしい。'
    },
    {
      id: 84,
      name: '<span style="color: blue; font-weight: bold;">閉じられた祭殿</span>',
      status: 0,
      desc: '一時的に祭殿から歩いて出られなくなる。'
    },
    {
      id: 85,
      name: '<span style="color: blue; font-weight: bold;">たくさん積まれた石</span>',
      status: 0,
      desc: '石がたくさん積まれているが、いまこれを持ってバルコニーを通る事はできない。<br/>注意※カート職ならこの段階で積む事も可能です'
    },
    {
      id: 86,
      name: '<span style="color: blue; font-weight: bold;">たくさん積まれた石</span>',
      status: 0,
      desc: '石を合計1000個謁見の間に持っていくと、円卓の間へ入れるようになる。'
    },
    {
      id: 87,
      name: '<span style="color: blue; font-weight: bold;">円卓の間の扉</span>',
      status: 0,
      desc: '石を合計1000個謁見の間に持っていくと、円卓の間へ入れるようになる。'
    },
    {
      id: 88,
      name: '<span style="color: blue; font-weight: bold;">謁見の間の魔力障壁</span>',
      status: 0,
      desc: '円卓の間の騎士像を左へ動かすと、謁見の間の魔力障壁が解除される。'
    },
    {
      id: 89,
      name: '<span style="color: blue; font-weight: bold;">図書室のレバー</span>',
      status: 0,
      desc: '操作すると、バルコニー②の重量制限が解除される。'
    },
    {
      id: 90,
      name: '<span style="color: blue; font-weight: bold;">東屋上のレバー</span>',
      status: 0,
      desc: '操作すると、「城内通路2F01」↔「城壁2F07」間のWPが開放される。'
    },
    {
      id: 91,
      name: '<span style="color: blue; font-weight: bold;">南東3Fのレバー</span>',
      status: 0,
      desc: '操作すると、「中庭（東）」↔「東1F」間のWPが開放される。'
    },
    {
      id: 92,
      name: '<span style="color: blue; font-weight: bold;">南②1Fのレバー</span>',
      status: 0,
      desc: '操作すると、「城門①1F」↔「南②1F」間のWPが開放される。'
    },
    {
      id: 93,
      name: '<span style="color: blue; font-weight: bold;">転移の封印（南東3F）</span>',
      status: 0,
      desc: '転移の石碑で南東3Fに転移できるようになる。'
    },
    {
      id: 94,
      name: '<span style="color: blue; font-weight: bold;">転移の封印（南東1F）</span>',
      status: 0,
      desc: '転移の石碑で南東1Fに転移できるようになる。'
    },
    {
      id: 95,
      name: '<span style="color: blue; font-weight: bold;">転移の封印（南②屋上）</span>',
      status: 0,
      desc: '転移の石碑で南②屋上に転移できるようになる。'
    },
    {
      id: 96, // NOTICE, WORKAROUND: 同じ鍵で開く場所が2箇所ある
      name: '<span style="color: blue; font-weight: bold;">塔・東3Fの鍵</span>',
      status: 0,
      desc: '塔・東3Fの鍵は塔・南東B1Fにある。'
    },
    {
      id: 97,
      name: '<span style="color: blue; font-weight: bold;">水量2</span>',
      status: 0,
      desc: '水量が2の時、水路01,02,03と噴水最深部が進入不可となる。プランターで王家の花の種を育てられる。'
    },
    {
      id: 98,
      name: '<span style="color: blue; font-weight: bold;">使用人居住区の鍵</span>',
      status: 0,
      desc: '使用人居住区の鍵は使用人部屋①にある。'
    },
    {
      id: 99,
      name: '<span style="color: blue; font-weight: bold;">プランター</span>',
      status: 0,
      desc: '水門①と水門②を両方開けると、王家の花の種を育てられるようになる。'
    },
    {
      id: 100,
      name: '<span style="color: blue; font-weight: bold;">王の墓</span>',
      status: 0,
      desc: '王家の花を捧げると、神殿地下への道が開かれる。'
    }
  ]
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
.angel-name {
  position: relative;
  pointer-events: none;
  margin-bottom: -5px;
  white-space: nowrap;
  z-index: 2;
  color: black;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
}

.bal-left {
  position: relative;
  padding: 15px;
  border-radius: 8px;
  background-color: rgb(219, 244, 253);
  margin-left: 20px;
}

.bal-left::before {
  content: '';
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  left: -10px;
  top: 10px;
  border-right: 10px solid rgb(219, 244, 253);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

.bal-right {
  position: relative;
  padding: 15px;
  border-radius: 8px;
  background-color: rgb(240, 230, 255);
  margin-right: 20px;
}

.bal-right::before {
  content: '';
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  right: -10px;
  top: 10px;
  border-left: 10px solid rgb(240, 230, 255);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

.face-image {
  flex: 0 0 60px;
}

.face-image > img {
  width: 100%;
}
.gimmick-img {
  border: 1px solid darkred;
  height: 26px;
}
.defeated-img {
  width: 60px;
  height: 60px;
}
.key-img {
  width: 12px;
  height: 24px;
}
.highlight-room {
  opacity: 0.75;
  background-color: lightblue;
  box-shadow: 0 0 10px skyblue; 
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
.room-box-thum {
  box-sizing: border-box;
  overflow: hidden;
}
.tiamat-top {
  margin-top: 100px;
}
.teams {
  user-select: none;
  margin: 5px;
  min-width: 200px;
  background-color: lightblue;
  text-align: center;
  border-radius: 3px;
}
.selected-team {
  background-color: skyblue;
  font-weight: bold;
  margin-top: -10px;
  font-size: 1.5em;
}
.havekey {
  user-select: none;
  background-color: lightseagreen;
  border-radius: 2px;
  font-weight: bold;
}
.haventkey {
  user-select: none;
  background-color: lightgray;
  border-radius: 2px;
}
</style>