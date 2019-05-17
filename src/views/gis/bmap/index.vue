<template>
<div>
<el-row>
  <el-col :span="6" >
    <!-- 导航区 -->
    <el-tabs v-model="nav.activeName" @tab-click="navClick" :type="tabType">
      <el-tab-pane  :name="nav.customerNav.name">
        <span slot="label"><i :class="nav.customerNav.icon">&nbsp;</i>{{nav.customerNav.label}}</span>
        <customer-nav></customer-nav>
      </el-tab-pane>
      <el-tab-pane :name="nav.areaNav.name">
        <span slot="label"><i :class="nav.areaNav.icon">&nbsp;</i>{{nav.areaNav.label}}</span>
        <area-nav></area-nav>
      </el-tab-pane>
    </el-tabs>
  </el-col>
  <el-col :span="18" >
    <!-- 视图区 -->
    <el-tabs v-model="view.activeName" @tab-click="navClick" :type="tabType">
      <el-tab-pane :label="view.mapView.label" :name="view.mapView.name">
        <span slot="label"><i :class="view.mapView.icon">&nbsp;</i>{{view.mapView.label}}</span>
        <el-form :inline="true" :model="query" class="demo-form-inline">
            <el-form-item label="">
              <el-autocomplete
                class="inline-input"
                v-model="query.nameOrSnKey"
                :fetch-suggestions="querySearch"
                placeholder="请输入DTU名称、表示UID"
                :trigger-on-focus="false"
                @select="handleSelect">
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="">
              <el-input
                placeholder="地址位置信息查询"
                icon="search"
                v-model="query.cityKey"
                :on-icon-click="handleIconClick">
              </el-input>
            </el-form-item>
            <el-form-item>
              <!-- 找到home图标后换图标 -->
              <!-- <el-button type="primary" icon="edit"  @click="toHome"></el-button> -->
              <el-button type="primary" @click="toHome">Home</el-button>
              <el-button type="primary" icon="search" @click="addDTU">新增DTU</el-button>
              <el-button type="primary" icon="search" @click="enableChangeLation">设备定位</el-button>
            </el-form-item>
          </el-form>
        <baidu-map class="bmap-view" 
          :ak="bmap.ak" 
          :center="bmap.center" 
          :zoom="bmap.zoom" 
          @ready="bmapReady"
          :scroll-wheel-zoom="bmap.enableScrollWheelZoom"
          >
          <!-- 缩放控件 -->
          <bm-navigation :anchor="bmap.nav.anchor"></bm-navigation>
          <!-- 地图类型切换 -->
          <bm-map-type :map-types="bmap.mapType.types" :anchor="bmap.mapType.anchor"></bm-map-type>
          <!-- 地图上点位 -->
          <template v-for="point in bmap.points">
            <bm-marker :key="point.animation" :position="point.position" :dragging="point.dragging" :animation="point.animation" @click="clickPointHandle">
              <!-- <bm-label :content="我爱北京天安门" :labelStyle="{color: 'red', fontSize : '24px'}" :offset="{width: -35, height: 30}"/> -->
            </bm-marker>
          </template>
          <!-- <bm-point-collection :points="bmap.points.list" :shape="bmap.points.shape" color="bmap.points.color" size="bmap.points.size"  @click="clickPointHandle"></bm-point-collection> -->
        </baidu-map>
      </el-tab-pane>
      <el-tab-pane :label="view.listView.label" :name="view.listView.name">
        <span slot="label"><i :class="view.listView.icon">&nbsp;</i>{{view.listView.label}}</span>
      </el-tab-pane>
    </el-tabs>
     
  </el-col>
</el-row>
<!-- 新增DTU弹框 -->
<add-dtu :show="addDTUDialog.show" @fail="addDTUFail" @success="addDTUSuccess"></add-dtu>
</div>
</template>

<script>
import {
  BaiduMap,
  BmNavigation,
  BmMapType,
  BmMarker,
  BmLabel,
  BmPointCollection,
  BmInfoWindow,
} 
from 'vue-baidu-map'
import CustomerNav from './components/CustomerNav.vue'
import AreaNav from './components/AreaNav.vue'
import AddDtu from './components/AddDTU.vue'

import {
  fetchTree, getObj, addObj, delObj, putObj
} from 'api/admin/menu/index';
import { mapGetters } from 'vuex';
export default {
  name: 'menu',
  components: {
    BaiduMap,
    BmNavigation,
    BmMapType,
    BmMarker,
    BmLabel,
    BmPointCollection,
    BmInfoWindow,
    CustomerNav,
    AreaNav,
    AddDtu,
  },
  data() {
    return {
      //带阴影边框类型的tab
      tabType:"border-card",
      //导航tab栏
      nav:{
        activeName: 'customerNav',
        customerNav:{
          icon:"el-icon-date",
          label:"客户导航",
          name:"customerNav"
        },
        areaNav:{
          icon:"el-icon-date",
          label:"区域导航",
          name:"areaNav"
        }
      },

      //视图tab栏
      view:{
        activeName: 'mapView',
        mapView:{
          icon:"el-icon-date",
          label:"设备地图",
          name:"mapView"
        },
        listView:{
          icon:"el-icon-date",
          label:"设备列表",
          name:"listView"
        },
      },
      
      //百度地图配置
      bmap:{
        ak:"gnLfRsEGqXzdG3huMaq9yGWTw7xpZ0nf",
        center: {lng: 0, lat: 0},
        zoom: 3,
        enableScrollWheelZoom:true,
        //缩放导航控件
        nav:{
          //位置左上
          anchor:"BMAP_ANCHOR_TOP_LEFT",
        },
        //地图类型控件
        mapType:{
          //平面图和卫星图
          types:['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP'],
          //位置右上
          anchor:"BMAP_ANCHOR_TOP_RIGHT",
        },
        //地图上少量点使用，并需要对单个点操作
        points:[
          {
            position:{lng: 116.404, lat: 39.915},
            dragging:false,
            animation:"BMAP_ANIMATION_BOUNCE",
          }
        ],

        //地图上大量点时使用
        // points:{
        //   list:[],
        //   shape:"",
        //   color:"red",
        //   size:"BMAP_POINT_SIZE_SMALL"
        // }
         
      },
      //运行修改地图上坐标位置状态
      enableChangeLationStatus:false,

      //查询条件
      query:{
        //名称或编号关键字
        nameOrSnKey:"",
        //城市地址等关键字
        cityKey:""
      },
      
      /**
       * 新增DTU弹框
       */
      addDTUDialog:{
        show:false,
      },

      currentId: -1,
      areaManager_btn_add: false,
      areaManager_btn_edit: false,
      areaManager_btn_del: false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  created() {
    this.areaManager_btn_add = this.elements['areaManager:btn_add'];
    this.areaManager_btn_del = this.elements['areaManager:btn_del'];
    this.areaManager_btn_edit = this.elements['areaManager:btn_edit'];
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
  },
  methods: {
    
    /**
     * 导航tab栏点击
     */
    navClick(tab, event) {
        console.log(tab, event);
    },

    /**
     * 关键词搜索
     */
    querySearch(){

    },
    /**
     * 关键词搜索选择后处理方法
     */
    handleSelect(){

    },

    /**
     * 点击搜索图标处理方法
     */
    handleIconClick(){

    },
    /**
     * 返回到默认位置
     */
    toHome(){

    },

    /**
     * 添加DTU设备，打开新增弹出框
     */
    addDTU(){
      this.addDTUDialog.show = true;
    },
    /**
     * 添加DTU成功后回调
     */
    addDTUSuccess(form){
      //TODO 成功后追加覆盖物到地图上
      let rom = Math.random();
      this.bmap.points.push(
        {
            position:{lng: 116.404+rom, lat: 39.915+rom},
            dragging:false,
            animation:"BMAP_ANIMATION_BOUNCE",
          }
      ); 
      this.addDTUDialog.show = false;
    },
    /**
     * 添加DTU失败或取消后回调
     */
    addDTUFail(status){
      this.addDTUDialog.show = false;
      if(status == 1){
        //失败
        this.$message.error('添加DTU失败');
      }
    },

    /**
     * 百度地图初始化完成
     */
    bmapReady({BMap, map}) {
        console.log(BMap, map)
      this.bmap.center.lng = 116.404;
      this.bmap.center.lat = 39.915;
      this.bmap.zoom = 15;
      
    },

    /**
     * 支持修改地图上DTU设置位置
     */
    enableChangeLation(){
      if(this.enableChangeLationStatus){
        this.bmap.points.forEach(element => {
          element.dragging = false;
        });
      }else{
        this.bmap.points.forEach(element => {
          element.dragging = true;
        });
      }
      this.enableChangeLationStatus = !this.enableChangeLationStatus;
    },
    /**
     * 点击地图上点处理方法
     */
    clickPointHandle(){

    },
    // addPoints() {
    //   const points = [];
    //   for (var i = 0; i < 1000; i++) {
    //     const position = {lng: Math.random() * 40 + 85, lat: Math.random() * 30 + 21}
    //     points.push(position)
    //   }
    //   this.bmap.points.list = points
    // },
  },
  mounted(){
    
  },
}
</script>

<style scoped>
.bmap-view{
  height: 550px;
}
</style>


