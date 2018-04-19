import { Component, Vue, Prop, Watch } from 'vue-property-decorator';


import { timeout, getLocalUserInfo } from 'common.env';


import './unauthorized.scss';
@Component({
    template: require('./unauthorized.html'),
})
export class Unauthorized extends Vue {
    @Prop({ type: Function, default: () => { } })
    close;

    @Prop({ type: Boolean, default: true })
    showAuth;

    //审核状态("配送员审核未提交",0),("配送员审核未处理",1),("配送员审核成功",2),("配送员审核未通过",3)
    //查询后用户状态（("未提交申请",0),  ("未处理",1),    ("认证未通过",2),   ("异常",3),   ("认证成功",4);）
    @Prop({ type: Object, default: () => { return { checkState: 0, errorCode: 0, state: 0 } } })
    data;

    show = false;

    btnStr = '马上认证';

    title = '配送员';

    mounted() {
        this.$nextTick(() => {
            this.showContent();
            this.authtype = this.data.authtype;
            this.state = this.data.state;
            if (this.authtype === 'sfz') {
                // 身份证实名
                if (this.state == 1) {
                    this.btnStr = '认证审核中';
                } else if (this.state == 2) {
                    this.btnStr = '审核未通过, 请重新认证';
                } else {
                    this.btnStr = '马上认证';
                }
                this.title = '实名';
            } else {
                this.checkState = this.data.checkState;
                if (this._checkState == 1) {
                    this.btnStr = '认证审核中';
                } else if (this.checkState == 3) {
                    this.btnStr = '审核未通过, 请重新认证';
                } else {
                    this.btnStr = '马上认证';
                }
                this.title = '配送员';
                if (this.data.errorCode) {
                    this.title = this.data.errorCode == 222 ? '实名' : '配送员';
                }
            }


            //console.log('authdata: ', this.data);
        });
    }

    @Watch('showAuth')
    watchShowAuth(newVal, oldVal) {
        if (newVal) {
            this.showContent();
        }
    }

    showContent() {
        timeout(() => {
            this.show = true;
        }, 100);
    }



    closeSelf() {
        this.show = false
        timeout(() => {
            this.close();
        }, 400);
    }

    noTouchMove(e) {
        e.preventDefault();
        return false;
    }
    // 审核状态("配送员审核未提交",0),("配送员审核未处理",1),("配送员审核成功",2),("配送员审核未通过",3)
    toAuth() {

        if (this.authtype === 'sfz') {
            if (this.state || this.state != '0') {
                this.$router.push('realname_result');
            } else {
                this.$router.push('realname');
            }

        } else {
            if (this.data.errorCode == 222) {
                this.$router.push('realname');
            } else {
                if (this.checkState || this.checkState != '0') {
                    this.$router.push('distributor_realname_result');
                } else {
                    this.$router.push('distributor_realname');
                }
            }
        }

    }
}