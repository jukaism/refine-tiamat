<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      fixed
    >
      <v-list dense>
        <template v-for="item in items">
          <v-row
            v-if="item.heading"
            :key="item.heading"
            align="center"
          >
            <v-col cols="6">
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-col>
            <v-col
              cols="6"
            >
              <a
                :href="item.to"
                class="body-2 black--text"
              >EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <template v-slot:activator>
              <v-list-item class="pl-0">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              class="ml-5"
              :key="i"
              :to="child.to"
              router
              exact
              link
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
            v-else
            :key="item.text"
            :to="item.to"
            link
          >
            <v-list-item-action
              v-if="item.icon"
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title
        v-text="'古城の絆（β）'"
        style="min-width: 100px; font-size: 1em;"
      />
    </v-app-bar>
    <nuxt />
  </v-app>
</template>

<script lang="ts">
import { VuexModule } from 'vuex-module-decorators'
import { Component, Watch, Vue } from "vue-property-decorator"

@Component({})
export default class TiamatLayout extends Vue {
  items = [
    {
      text: 'Top',
      to: '/',
    }
  ]
  clipped = false
  drawer = false
  fixed = false
  miniVariant = false
  right = true
  rightDrawer = false
  title = 'Nuxtro'
  modal: {
    visible: boolean,
    head: string,
    body: string,
  } = {
    visible: false,
    head: '',
    body: '',
  }
  memo: string = ''
  private mounted() {
    document.documentElement.style.overflowX = 'auto';
  }
  private beforeDestroy() {
    document.documentElement.style.overflowX = 'hidden';
  }
  openRightMenu() {
    this.rightDrawer = true
  }
}
</script>

<style lang="scss">
</style>
