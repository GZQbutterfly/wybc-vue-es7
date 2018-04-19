// 缴纳保证金回调本页面
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import service from './up.service';



import './up.scss';
@Component({
    template: require('./up.html')
})
export class GradeUp extends BaseVue {
    // 是否已缴纳保证金
    steps = [];
    stepIndex = 1;
    currentStep = {};
    upName = '';
    // 支付选择面板
    payList = [];
    payActive = '';
    succeed = false;
    msg = '';
    _$service;
    mounted() {
        // 注册服务
        this._$service = service(this.$store);


        let _query = this.$route.query || {};
        this.upName = _query.name;
        this.grade = _query.grade;

        // 页面标题
        document.title = '晋级结果';

        // 页面加载后的流程数据流向
        this.$nextTick(() => {
            this.queryShopSteps();
        });
    }
    /**
     * 获取微店的等级状态信息
     */
    queryShopSteps() {
        let datas = this._$service.queryShopSteps();
        this.steps = datas;
        // 判断当前节点
        let _stepIndex = -1;
        let _currentStep = {};
        for (let i = 0, len = datas.length; i < len; i++) {
            let step = datas[i];
            if (step.success) {
                // 获取当前节点
                _stepIndex = i;
                _currentStep = datas[i];
            } else {
                break;
            }
        }
        this.stepIndex = _stepIndex;
        this.currentStep = _currentStep;
        switch (_stepIndex) {
            // 第一节点
            case 0:
                // 1, 是否需要缴纳保证金
                if (!_currentStep.isDeposit) {
                    this.queryPays();
                }
                break;
            // 第二节点
            case 1:
                break;
            // 第三节点
            case 2:
                break;
            default:
        }
        this.queryUpResult();
    }

    // {
    //     "flag": 1   //  1:升级成功,0:升级失败   
    //     erroCode:109  "处理中  请稍后刷新界面..."
    //     }
    async queryUpResult() {
        let _userId = this.$store.state.workVO.user.userId;
        let _result = (await this._$service.queryUpInfo({ infoId: _userId, grade: this.grade })).data;
        if (!_result || _result.errorCode || _result.flag == '0') {
            this.msg = (_result && _result.msg) || '升级失败';
            this.alertDialog(this.msg);
        } else {
            this.succeed = true;
        }
    }


    dialogFlag = false;
    alertDialog(msg = '处理中  请稍后刷新界面...') {
        let _self = this;
        if (_self.dialogFlag) {
            return;
        }
        _self.dialogFlag = true;
        let dialogObj = {
            title: '提示',
            type: 'info',
            content: msg,
            assistBtn: '',
            mainBtn: '确认',
            assistFn() {
                _self.dialogFlag = false;
            },
            mainFn() {
                _self.dialogFlag = false;
            }
        };
        _self.$store.state.$dialog({ dialogObj });
    }

    /**
     * 获取支付方式
     */
    queryPays() {
        this._$service.queryPays().then((datas) => {
            this.payList = datas;
            this.payActive = datas[0].type;
        });
    }
    switchStep(step, index) {
        this.stepIndex = index;
        this.currentStep = step;
        if (!step.isDeposit) {
            this.queryPays();
        }
    }
    // 支付选择
    swtichPay(item) {
        this.payActive = item.type;
    }
    // 下个节点
    nextSetp() {
        this.stepIndex++;
        this.currentStep = this.steps[this.stepIndex];
        this.currentStep.success = true;
    }
    toPay() {
        let _self = this;
        this._$service.toPay({
            'url': '/cms/#/gradeUp?name=' + this.upName
        }, this.payActive).then((res) => {
            if (res) {
                this.queryShopSteps();
            } else {
                let dialogObj = {
                    title: '提示',
                    content: '您已取消支付',
                    type: 'info',
                    mainBtn: '知道啦',
                    mainFn() { }
                };
                _self.$store.state.$dialog({ dialogObj });
            }
        });
    }
    /**
     * 去进货
     */
    toPurchase() {
        // 跳转进货页面
        this.$router.push('cms_purchase');
    }
    toHome() {
        this.$router.push('/');
    }
}
