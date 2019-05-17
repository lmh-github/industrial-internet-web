<template>
    
    <el-dialog :title="title" :visible.sync="visible" :before-close="cancelClick">
      <el-form :model="form">
        <el-form-item label="活动名称" :label-width="formLabelWidth">
        <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动区域" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
        </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" @click="handleClick">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
  export default {
    props:{
      show:Boolean
    },
    data() {
      return {
        title:"新增DTU",
        _visible:false,
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px',
      };
    },
    computed:{
      visible:{
        get(){
          return this.show;
        },
        set(val){
           this._visible = val;
        }
      }
    },
    methods:{
      /**
       * 确定保存DTU
       */
      handleClick(){
        //TODO 保存后回调
        this.$emit("success",this.form);

        //失败后调用 this.$emit("fail",1);
      },
      /**
       * 取消操作
       */
      cancelClick(){
        this.$emit("fail",0);
      }
    },
  };
</script>