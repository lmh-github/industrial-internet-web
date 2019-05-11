<template>
<div class="app-container calendar-list-container " >
    <div >
        <el-row>
          <el-collapse style="position: relative;" value='condition' >
            <el-collapse-item title='查询条件' name='condition'>
              <el-form :inline='true' class='demo-form-inline' label-width='100px' ref='queryForm'>
                <el-form-item label='年' prop='customerName'>
                    <el-date-picker
                    :clearable='false'
                     @change="clickAlarmYearMonth"
                      v-model="queryDateYear"
                      align="right"
                      type="year"
                      placeholder="选择年">
                    </el-date-picker>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-row>
      </div>

    <div>
      <energyReportBar :option="option" ></energyReportBar>
    </div>

    <div class='tab_border'>
      <el-table :key='tableKey' :data="list" v-loading.body="listLoading"  border fit highlight-current-row >

    <el-table-column label="#" type='index' min-width='30'></el-table-column>
    <!-- <el-table-column label="#" type="selection" min-width="30"></el-table-column> -->
    <el-table-column label='报警类型' prop='alarmTypeName' min-width='150'></el-table-column>
    <el-table-column label='DTU名称' prop='totilName' min-width='100'></el-table-column>
    <el-table-column label='DTU标识码' prop='totilId' min-width='100'></el-table-column>
    <el-table-column label='报警时间' prop='alarmTime' min-width='100'></el-table-column>
    <el-table-column label='短信通知' prop='sms' min-width='100'>
      <template scope="scope">
        <div :style="scope.row.sms != 1 ? 'color: red' : ''" v-html="scope.row.sex == 1 ? scope.row.smsPhone : '未发送'"></div>
      </template>
    </el-table-column>
    <el-table-column label='邮件通知' prop='email' min-width='100'>
      <template scope="scope">
        <div :style="scope.row.email != 1 ? 'color: red' : ''" v-html="scope.row.email == 1 ? scope.row.emailAddress : '未发送'"></div>
      </template>
    </el-table-column>
    <el-table-column label='处理时间' prop='fixTime' min-width='100'></el-table-column>
    <el-table-column label='处理人' prop='fixUserName' min-width='100'></el-table-column>
    <el-table-column label='处理方式' prop='fixTypeName' min-width='100'></el-table-column>
    <el-table-column label="操作" width="150" min-width="250" fixed='right' fit='false' > 
      <template scope="scope">
        <el-button size="small" type="primary" @click="handleDetail(scope.row)">详情
        </el-button>
      </template> 
    </el-table-column>
  </el-table>
  <el-row type='flex' justify='end' class="pagination-container">
      <el-pagination :page-sizes='[10, 20, 50, 100]' :page-size='listQuery.limit' layout='prev,pager,next,jumper,total,sizes' :total='total' :current-page.sync='listQuery.page' @current-change='handleCurrentChange' @size-change='handleSizeChange'>
      </el-pagination>
  </el-row>
</div>

<el-dialog title="报警详情信息" :visible.sync="dialogDetailFormVisible">
    <el-form :model="form"  label-width="150px">
      <el-form-item label="故障类型" prop="alarmType">
        <el-input v-model="form.alarmType" disabled ></el-input>
      </el-form-item>
      <el-form-item label="报警时间" prop="alarmTime">
        <el-input v-model="form.alarmTime" disabled ></el-input>
      </el-form-item>
      <el-form-item label="短信" prop="sms">
        <div :style="form.sms != 1 ? 'color: red' : ''" v-html="form.sms == 1 ? form.smsPhone : '未发送'"></div>
      </el-form-item>
      <el-form-item label="邮件" prop="email">
         <div :style="form.email != 1 ? 'color: red' : ''" v-html="form.email == 1 ? form.emailAddress : '未发送'"></div>
      </el-form-item>
      <el-form-item label="处理人" prop="fixUserName">
        <el-input v-model="form.fixUserName" disabled></el-input>
      </el-form-item>
      <el-form-item label="处理方式" prop="fixType">
        <el-input v-model="form.fixType" disabled></el-input>
      </el-form-item>
      <el-form-item label="处理时间" prop="stationId">
        <el-input v-model="form.fixTime" disabled></el-input>
      </el-form-item>
      <el-form-item label="备注(故障现象,原因分析,解决方法,结果)">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" v-model="form.remark"> </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogDetailFormVisible = false">关闭</el-button>
    </div>
  </el-dialog>


</div>
</template>
<script>
import {
  getAlarmYearMonth,
  faultReportPage,
  page
} from 'api/things/faultReport/index';
import { mapGetters } from 'vuex';
import energyReportBar from 'components/Charts/energyReportBar.vue';
export default {
  name: 'energyReport',
  data() {
    return {
      queryDateYear: new Date(), // 时间控件选择值
      list: null,
      total: null,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        dateYear: new Date() // 查询所属年
      },
      tableKey: 0,
      dialogDetailFormVisible: false, // 控制详情模态框是否显示
      form: {}, // 显示详情信息
      // ------------ echarts 图片数据 ---------------------
      option: {
        title: {
            //  text: '便器能耗分析报表'
            //  subtext: '纯属虚构'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['报警数量(个)', '报警数量变化曲线']
        },
        grid: {
          height: '500px'
        },
        toolbox: {
          show: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: []
          },
          {
            type: 'category',
            boundaryGap: true,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            name: '报警数量(个)',
            min: 0,
            boundaryGap: [0.2, 0.2]
          },
          {
            type: 'value',
            scale: true,
            name: '报警数量变化曲线',
            min: 0,
            boundaryGap: [0.2, 0.2]
          }
        ],
        dataZoom: {
          show: false,
          start: 0,
          end: 100
        },
        series: [
          {
            name: '报警数量(个)',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: []
          },
          {
            name: '报警数量变化曲线',
            type: 'line',
            data: []
          }
        ] }
    }
  },
  created() {
    this.clickAlarmYearMonth(this.queryDateYear.getFullYear());
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
  },
  components: {
    energyReportBar
  },
  methods: {
    // 获取年报警统计数据方法
    clickAlarmYearMonth(val) {
      console.log(val);
      this.listQuery.dateYear = val;
      this.getList();
      getAlarmYearMonth({ date: val }).then(response => {
        console.log(response);
        this.option.xAxis[0].data = response.dateList;
        this.option.xAxis[1].data = response.dateList;
        this.option.series[0].data = response.totilNumList;
        this.option.series[1].data = response.totilNumList;
      });
    },
    getList() {
      this.listLoading = true;
      faultReportPage(this.listQuery)
        .then(response => {
          this.list = response.data.rows;
          this.total = response.data.total;
          this.listLoading = false;
        })
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
    // 显示报警详情信息
    handleDetail(row) {
      this.dialogDetailFormVisible = true;
      this.form = row;
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

</style>
