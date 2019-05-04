<template>
<div class="app-container calendar-list-container">
  
  <!-- <el-button  size="small" type="success" @click="handleUpdate(scope.row)">更新</el-button> -->
     
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <template v-for="item in list">
        <el-form-item :label="item.name" :prop="item.code" v-bind:key="item.id">
          <el-input style="width: 60%;" v-model="item.value" placeholder="请输入消耗水"></el-input>
        </el-form-item>
      </template>
      
      <!-- <el-form-item label="消耗电" prop="areaname">
        <el-input style="width: 60%;" v-model="form.name" placeholder="请输入消耗电"></el-input>
      </el-form-item> -->
      <el-form-item >
          <el-button v-if="dtuConfigInfoManager_btn_edit" type="primary" @click="handleUpdate()" >更新</el-button>
      </el-form-item>
    </el-form>
    
</div>
</template>

<script>
import {
  getListAll,
  addObj,
  getObj,
  delObj,
  putObj
} from 'api/things/dtuConfigInfo/index';
import { mapGetters } from 'vuex';
export default {
  name: 'user',
  data() {
    return {
      form: {
        username: undefined,
        name: undefined,
        sex: '男',
        password: undefined,
        description: undefined
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入用户',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ]
      },
      list: null,
      total: null,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        type: undefined
      },
      dtuConfigInfoManager_btn_edit: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0
    }
  },
  created() {
    this.getList();
    this.dtuConfigInfoManager_btn_edit = this.elements['dtuConfigInfoManager:btn_edit'];
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
  },
  methods: {
    getList() {
      this.listLoading = true;
      getListAll().then(response => {
        this.list = response;
        for (const index in response) {
          console.log(index);
          const code = this.list[index].code;
          this.rules.code =
          [
            {
              required: true,
              message: '请输入用户',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 20,
              message: '长度在 3 到 20 个字符',
              trigger: 'blur'
            }
          ]
        }
      });
    },
    handleFilter() {
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
    },
    handleUpdate(row) {
      getObj(row.id)
        .then(response => {
          this.form = response.data;
          this.dialogFormVisible = true;
          this.dialogStatus = 'update';
        });
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          delObj(row.id)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              });
              const index = this.list.indexOf(row);
              this.list.splice(index, 1);
            });
        });
    },
    create(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form)
            .then(() => {
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              });
            })
        } else {
          return false;
        }
      });
    },
    cancel(formName) {
      this.dialogFormVisible = false;
      this.$refs[formName].resetFields();
    },
    update(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          this.form.password = undefined;
          putObj(this.form.id, this.form).then(() => {
            this.dialogFormVisible = false;
            this.getList();
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            });
          });
        } else {
          return false;
        }
      });
    },
    resetTemp() {
      this.form = {
        username: undefined,
        name: undefined,
        sex: '男',
        password: undefined,
        description: undefined
      };
    }
  }
}
</script>
