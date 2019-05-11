<template>

<div class="app-container calendar-list-container">
  <div >
    <el-row>
      <el-collapse style="position: relative;" value='condition' >
        <el-collapse-item title='查询条件' name='condition'>
          <el-form :model='listQuery' :inline='true' class='demo-form-inline' label-width='100px' ref='queryForm'>
            <el-form-item label='设备名称' prop='totilName'>
              <el-input placeholder="模糊查询" v-model='listQuery.totilName' @keyup.enter.native="handleFilter"></el-input>
            </el-form-item>
            <el-form-item label='SN码' prop='codeSn'>
              <el-input placeholder="模糊查询" v-model='listQuery.codeSn' @keyup.enter.native="handleFilter"></el-input>
            </el-form-item>
            <el-form-item label='状态' prop='totilState'>
              <el-select class="filter-item" clearable @clear="clearTotilState" v-model="listQuery.totilState" placeholder="请选择">
                <el-option v-for="item in stateOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
            <div style='text-align:center'>
              <el-form-item>
                <el-button type='primary' @click='handleFilter' >查询</el-button>
                <el-button @click='cancel("queryForm")'>重置</el-button>
              </el-form-item>
            </div>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-row>
  </div>

<div class='tab_border'>
  <div class="search_title">列表查询结果</div>
  <div class="button_position">
      <el-button type='primary' v-if="stationsManager_btn_add" class="filter-item" @click="handleCreate('form')" icon="plus" >添加</el-button>
  </div>
  <el-table :key='tableKey' :data="list" v-loading.body="listLoading"  border fit highlight-current-row >

    <el-table-column label="#" type='index' min-width='30'></el-table-column>
    <el-table-column label='设备名称' prop='totilName' min-width='150'></el-table-column>
    <el-table-column label='模块sn码' prop='codeSn' min-width='100'></el-table-column>
    <el-table-column label='SIM码' prop='sim' min-width='100'></el-table-column>
    <el-table-column label='数据规则' prop='dataRuleId' min-width='100'></el-table-column>
    <el-table-column label='状态' prop='totilState' min-width='100'>
      <template scope="scope">
        <div :style="scope.row.totilState != 1 ? 'color: red' : ''" v-html="scope.row.totilState == 1 ? '在线' : '离线'"></div>
      </template>
    </el-table-column>
    <el-table-column label='联系人' prop='relName' min-width='100'></el-table-column>
    <el-table-column label='联系号码' prop='relPhone' min-width='100'></el-table-column>
    <el-table-column label='所在地' prop='areaInfo' min-width='100'></el-table-column>
    <el-table-column label="操作" width="150" min-width="250" fixed='right' fit='false' > 
      <template scope="scope">
        <el-button v-if="stationsManager_btn_edit" size="small" type="primary" @click="handleUpdate(scope.row)">编辑
        </el-button>
        <el-button v-if="stationsManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
        </el-button>
      </template> 
    </el-table-column>
  </el-table>
  <el-row type='flex' justify='end' class="pagination-container">
      <el-pagination :page-sizes='[10, 20, 50, 100]' :page-size='listQuery.limit' layout='prev,pager,next,jumper,total,sizes' :total='total' :current-page.sync='listQuery.page' @current-change='handleCurrentChange' @size-change='handleSizeChange'>
      </el-pagination>
  </el-row>
</div>

  <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" size="small">
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="设备图片" prop="totilPic">
        <!-- <el-upload
          class="avatar-uploader"
          :action="this.file.uploadFileUrl"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload">
          <img v-if="form.systemLogo" :src="form.systemLogo" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload> -->
        <el-input v-model="form.totilPic" placeholder="请输入设备图片"></el-input>
      </el-form-item>

      <el-form-item label="设备名称" prop="totilName">
        <el-input v-model="form.totilName" placeholder="请输入设备名称"></el-input>
      </el-form-item>
      <el-form-item label="设备编号" prop="totilId">
        <el-input v-model="form.totilId" placeholder="请输入设备编号"></el-input>
      </el-form-item>
      <el-form-item label="模块SN码" prop="codeSn">
        <el-input v-model="form.codeSn" placeholder="请输入模块SN码"></el-input>
      </el-form-item>
      <el-form-item label="数据规则" prop="dataRuleId">
        <el-input style="width:80%" disabled v-model="form.dataRuleName" placeholder="请选择数据规则"></el-input>
        <el-button type="primary" @click.prevent="chooseDataRule()">选择</el-button>
      </el-form-item>
      <el-form-item label="SIM号" prop="sim">
        <el-input v-model="form.sim" placeholder="请输入SIM号"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="relName">
        <el-input v-model="form.relName" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="联系号码" prop="relPhone">
        <el-input v-model="form.relPhone" placeholder="请输入联系号码"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入备注" v-model="form.remark"> </el-input>
      </el-form-item>
      <el-form-item label="是否公开" prop="isPublic" >
        <el-radio v-model="form.isPublic" label="1">是</el-radio>
        <el-radio v-model="form.isPublic" label="0">否</el-radio>
      </el-form-item>
      <el-form-item label="所在地" prop="areaInfo" >
        <el-input style="width:80%" v-model="form.areaInfo"> </el-input>
        <el-button type="primary" @click.prevent="chooseDataRule(domain)">地图</el-button>
      </el-form-item>
      <el-form-item label="经纬度">
        <el-input style="width:45%"  placeholder="经度" disabled v-model="form.lng"> </el-input>
        <el-input style="width:45%" placeholder="纬度" disabled v-model="form.lat"> </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel('form')">取 消</el-button>
      <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
      <el-button v-else type="primary" @click="update('form')">确 定</el-button>
    </div>
  </el-dialog>

  <!---------------------   数据规则选择dialog框 ----------------------->

  <el-dialog :title="'选择数据规则'" :visible.sync="dataRuleDialogVisible" >
    <el-form :model='dataRuleListQuery' :inline='true' class='demo-form-inline' label-width='100px' ref='queryDataForm'>
      <el-form-item label='规则名称' prop='ruleName'>
        <el-input placeholder="模糊查询" v-model='dataRuleListQuery.ruleName' @keyup.enter.native="dataRuleHandleFilter"></el-input>
      </el-form-item>
      <el-form-item label='规则说明' prop='remark'>
        <el-input placeholder="模糊查询" v-model='dataRuleListQuery.remark' @keyup.enter.native="dataRuleHandleFilter"></el-input>
      </el-form-item>
      <div style='text-align:center'>
        <el-form-item>
          <el-button type='primary' @click='dataRuleHandleFilter' >查询</el-button>
          <el-button @click='cancelDataRule()'>重置</el-button>
        </el-form-item>
      </div>
    </el-form>

    <el-table :key='tableKey' :data="dataRulelist" v-loading.body="dataRuleListLoading" border fit highlight-current-row >
      <!--  type="selection" -->
      <el-table-column  label="#"  width="55">
          <template scope="scope">
              <el-radio class="radio" v-model="dataRuleId" :label="scope.row.id"  @change.native="getDataRuleRow(scope.$index,scope.row)" >
              </el-radio>
          </template>
      </el-table-column>
      <el-table-column label='规则名称' prop='totilName' min-width='150'></el-table-column>
      <el-table-column label='规则说明' prop='codeSn' min-width='100'></el-table-column>
    </el-table>
    <el-row type='flex' justify='end' class="pagination-container">
      <el-pagination :page-sizes='[10, 20, 50, 100]' :page-size='dataRuleListQuery.limit' layout='prev,pager,next,jumper,total,sizes' :total='dataRuleTotal' :current-page.sync='dataRuleListQuery.page' @current-change='dataRuleHandleCurrentChange' @size-change='dataRuleHandleSizeChange'>
      </el-pagination>
  </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelDataRule()">取 消</el-button>
      <el-button type="primary" @click="confirmDataRule()">确 定</el-button>
    </div>
  </el-dialog>

</div>
</template>
<script>
import {
  page,
  addObj,
  getObj,
  delObj,
  putObj
} from 'api/things/stations/index';
import { getObjId } from 'api/pubThings';
import { mapGetters } from 'vuex';
export default {
  name: 'user',
  data() {
    return {

      form: {
        id: undefined, // 子站(公厕)id
        dataRuleId: undefined, // 对应数据规则id
        dataRuleName: '', // 选择的数据规则名称
        sim: undefined, // sim号
        isPublic: '1', // 是否公开(1公开 0不公开)
        areaInfo: undefined, // 所在地址
        codeSn: undefined, // sn码
        totilName: undefined, // 公厕名称
        totilId: undefined, // 公厕编号
        areaId: undefined, // 区域位置id
        totilNum: undefined, // 便器数量
        bumpNum: undefined, // 泵站数量
        customerId: undefined, // 所属客户id
        remark: undefined, // 备注
        createTime: undefined, // 创建时间
        createMan: undefined, // 创建人id
        totilPic: undefined, // 照片地址
        totilTypeId: undefined, // 公厕类型编号
        totilState: '1', // NULL公厕状态 1在线 0 离线
        relName: undefined, // NULL联系人姓名
        relPhone: undefined, // NULL联系人电话
        relEmail: undefined, // NULL联系人邮箱
        lng: undefined, // 经度
        lat: undefined // 维度
      },
      stateOptions: [
        {
          id: '1',
          name: '在线'
        },
        {
          id: '0',
          name: '离线'
        }
      ],
      rules: {
        totilName: [
          {
            required: true,
            message: '请输入子站名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 225,
            message: '长度在 1 到 225 个字符',
            trigger: 'blur'
          }
        ],
        totilId: [
          {
            required: true,
            message: '请输入子站编号',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 50,
            message: '长度在 1 到 50 个字符',
            trigger: 'blur'
          }
        ],
        codeSn: [
          {
            required: true,
            message: '请输入sn码',
            trigger: 'blur'
          }
        ]
      },
      file: {
        uploadFileUrl: '',
        imageList: [],
        fileList: [],
        token: {
          // accessToken: getAccessToken()
        }
      },
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        totilName: undefined, // 子站名称
        codeSn: undefined, // sn码
        totilState: undefined // 状态
      },
      dialogFormVisible: false,
      dialogStatus: '',
      stationsManager_btn_edit: false,
      stationsManager_btn_del: false,
      stationsManager_btn_add: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      // ------  数据规则使用数据 -----------
      dataRuleId: null, // 选择的数据规则id
      dataRuleName: null, // 选择的数据规则名称
      dataRuleDialogVisible: false, // 控制数据规则模态框是否显示
      dataRuleTotal: null, // 总记录数
      dataRuleListQuery: {
        page: 1,
        limit: 20,
        ruleName: undefined, // 规则名称
        remark: undefined  // 规则
      }, // 数据规则查询条件说明
      dataRulelist: [], // 数据规则data
      dataRuleListLoading: true // 数据规则loading
    }
  },
  created() {
    this.getList();
    this.stationsManager_btn_edit = this.elements['stationsManager:btn_edit'];
    this.stationsManager_btn_del = this.elements['stationsManager:btn_del'];
    this.stationsManager_btn_add = this.elements['stationsManager:btn_add'];
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
  },
  methods: {
    getList() {
      this.listLoading = true;
      page(this.listQuery)
        .then(response => {
          this.list = response.data.rows;
          this.total = response.data.total;
          this.listLoading = false;
        })
    },
    // 清除totilState 查询条件
    clearTotilState() {
      this.listQuery.totilState = undefined;
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
      getObjId().then(id => {
        this.form.id = id;
        this.dialogStatus = 'create';
        this.dialogFormVisible = true;
      }).catch(err => {
        throw err;
      });
    },
    resetTemp() {
      this.form.id = undefined;// 子站(公厕)id
      this.form.dataRuleId = 0; // 对应数据规则id
      this.form.sim = undefined; // sim号
      this.form.isPublic = '1'; // 是否公开(1公开 0不公开)
      this.form.areaInfo = undefined; // 所在地址
      this.form.codeSn = undefined; // sn码
      this.form.totilName = undefined; // 公厕名称
      this.form.totilId = undefined; // 公厕编号
      this.form.areaId = undefined; // 区域位置id
      this.form.totilNum = undefined; // 便器数量
      this.form.bumpNum = undefined; // 泵站数量
      this.form.customerId = undefined; // 所属客户id
      this.form.remark = undefined; // 备注
      this.form.createTime = undefined; // 创建时间
      this.form.createMan = undefined; // 创建人id
      this.form.totilPic = undefined; // 照片地址
      this.form.totilTypeId = undefined; // 公厕类型编号
      this.form.totilState = '1'; // NULL公厕状态
      this.form.relName = undefined; // NULL联系人姓名
      this.form.relPhone = undefined; // NULL联系人电话
      this.form.relEmail = undefined; // NULL联系人邮箱
      this.form.lng = undefined; // 经度
      this.form.lat = undefined; // 维度
    },
    handleUpdate(row) {
      getObj(row.id)
        .then(response => {
          this.form = response.data;
          this.dialogFormVisible = true;
          this.dialogStatus = 'update';
        });
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      console.log(JSON.stringify(file.type));
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG,PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
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
      if (formName === 'queryForm') {
        this.getList();
      }
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
    // -------------- 选择数据规则方法 ----------------
    chooseDataRule() {
      this.dataRuleDialogVisible = true;
      this.dataRuleId = null; // 选择的数据规则id
      this.dataRuleName = null; // 选择的数据规则名称
      this.dataRuleHandleFilter();
    },
    getDataRuleRow(index, row) {
      console.log(index, row);
      console.log(row)
      this.dataRuleName = row.totilName;
      this.dataRuleId = row.id;
    },
    // 查询数据规则方法
    dataRuleHandleFilter() {
      this.dataRuleListLoading = true;
      page(this.dataRuleListQuery)
        .then(response => {
          this.dataRulelist = response.data.rows;
          this.dataRuleTotal = response.data.total;
          this.dataRuleListLoading = false;
        })
    },
    // 选择每页显示条数
    dataRuleHandleSizeChange(val) {
      this.dataRuleListQuery.limit = val;
      this.dataRuleHandleFilter();
    },
    // 跳转指定页码
    dataRuleHandleCurrentChange(val) {
      this.dataRuleListQuery.page = val;
      this.dataRuleHandleFilter();
    },
      // 确定选择数据规则
    confirmDataRule() {
      this.form.dataRuleName = this.dataRuleName;
      this.form.dataRuleId = this.dataRuleId;
      this.cancelDataRule();
    },
    // 取消或确定选择数据规则
    cancelDataRule() {
      this.dataRuleDialogVisible = false;
    }
  }

}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .avatar-uploader .el-upload:hover {
      border-color: #409EFF;
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

</style>
