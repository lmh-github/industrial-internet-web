<template>
<div class="app-container calendar-list-container">
  <div class="filter-container">
     <el-button-group>
      <el-button type="primary" v-if="areaManager_btn_add" icon="plus" @click="handlerAdd">添加</el-button>
      <el-button type="primary" v-if="areaManager_btn_edit" icon="edit" @click="handlerEdit">编辑</el-button>
      <el-button type="primary" v-if="areaManager_btn_del" icon="delete" @click="handleDelete">删除</el-button>
    </el-button-group>
  </div>

<el-row>
  <el-col :span="8" style='margin-top:15px;'>
    <el-input style='margin-bottom:15px;'
      placeholder="输入区域名称进行过滤"
      v-model="filterText">
    </el-input>
    <el-tree
      class="filter-tree"
      :data="treeData"
      node-key="id"
      highlight-current
      :props="defaultProps"
      :filter-node-method="filterNode"
      ref="menuTree"
      @node-click="getNodeData"
      default-expand-all
      >
    </el-tree>
  </el-col>
  <el-col :span="15" style='margin-top:15px;margin-left: 15px;'>
     <el-card class="box-card">
    <el-form :label-position="labelPosition" label-width="80px" :model="form" ref="form">
      <el-form-item label="上级区域" prop="code">
          <el-input v-model="form.parentName" :disabled="formEdit" placeholder="请输入上级区域"></el-input>
      </el-form-item>
      <el-form-item label="区域名称" prop="title">
          <el-input v-model="form.name" :disabled="formEdit"  placeholder="请输入区域名称"></el-input>
      </el-form-item>
          
      <el-form-item label="备注"   prop="description">
          <el-input v-model="form.remark" :disabled="formEdit" placeholder="请输入备注"></el-input>
      </el-form-item>
       
       <el-form-item v-if="formStatus == 'update'">
        <el-button type="primary" @click="update">更新</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
      <el-form-item v-if="formStatus == 'create'">
        <el-button type="primary" @click="create">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
     </el-card>
  </el-col>
</el-row>
  </div>
</template>

<script>
import {
  fetchTree, getObj, addObj, delObj, putObj
} from 'api/admin/menu/index';
import { mapGetters } from 'vuex';
export default {
  name: 'menu',
  components: {
    // 'menu-element': () => import('./components/element')
  },
  data() {
    return {
      filterText: '',
      list: null,
      total: null,
      formEdit: true,
      formAdd: true,
      formStatus: '',
      showElement: false,
      typeOptions: ['menu', 'dirt'],
      listQuery: {
        name: undefined
      },
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      labelPosition: 'right',
      form: {
        parentId: undefined,
        parentName: undefined,
        type: undefined,
        name: undefined,
        remark: undefined
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
    this.getList();
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
    getList() {
      fetchTree(this.listQuery).then(data => {
        this.treeData = data;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getNodeData(data) {
      if (!this.formEdit) {
        this.formStatus = 'update';
      }
      console.log(data);
      getObj(data.id).then(response => {
        this.form = response.data;
        console.log(this.form);
      });
      this.currentId = data.id;
      // this.form.parentId = data.id;
      // this.form.parentName = data.title;
      // this.form.name = data.areaName;
      this.showElement = true;
      // this.$refs.menuElement.menuId = data.id;
      // this.$refs.menuElement.getList();
    },
    handlerEdit() {
      if (this.form.id) {
        this.formEdit = false;
        this.formStatus = 'update';
      }
    },
    handlerAdd() {
      this.resetForm();
      this.formEdit = false;
      this.formStatus = 'create';
    },
    handleDelete() {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(this.currentId).then(() => {
          this.getList();
          this.resetForm();
          this.onCancel();
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          });
        });
      });
    },
    update() {
      putObj(this.form.id, this.form).then(() => {
        this.getList();
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        });
      });
    },
    create() {
      addObj(this.form).then(() => {
        this.getList();
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        });
      });
    },
    onCancel() {
      this.formEdit = true;
      this.formStatus = '';
    },
    resetForm() {
      this.form = {
        areaName: undefined, // 区域名称
        areaType: undefined, // 区域类型
        parentId: this.currentId, // 父级区域id
        areaAreaId: undefined, // 父级区域id
        remark: undefined // 备注
      };
    }
  }
}
</script>

