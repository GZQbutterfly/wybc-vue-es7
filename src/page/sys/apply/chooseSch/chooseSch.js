// 开店宣传信息
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import { isEmpty } from 'lodash';
import { getLocalUserInfo, isNotLogin, toLogin, toCMS } from 'common.env';
import Service from './chooseSch.service';
import './chooseSch.scss';

@Component({
    template: require('./chooseSch.html')
})

export class ApplyShopChooseSch extends BaseVue {
    tipImg = '/static/images/minishop/shenqingkaidian.png';
    _$popup;
    _$dialog;
    _$service;
    schoolList = [''];
    schoolIndex = 0;

    mounted() {
        let _self = this;
        this._$popup = _self.$store.state.$popup;
        this._$dialog = _self.$store.state.$dialog;
        this._$service = Service(this.$store);
        this.$nextTick(() => {
            document.title = "申请开店";
            _self.isLoginCheckHasWdAndIncode();
            _self.queryAllSchool();
        });
    }

    /**
     * 判断登陆 && 判断是否开店 && 判断邀请码
     */
    isLoginCheckHasWdAndIncode() {
        let _incode = this.$route.query.incode;
        if (isNotLogin()) {
            let _url = _incode ? ('?incode=' + _incode) : '';
            toLogin(this.$router, { toPath: 'apply_shop_campaign', realTo: 'apply_shop_campaign' + _url });
        } else {
            //check hasWd
            this.queryUserHasShop();
        }
    }

    /**
     * 查询用户是否开店
     */
    queryUserHasShop(cb) {
        let _self = this;
        this._$service.queryUserHasShop().then((res) => {
            console.log('用户开店信息', res);
            if (res.data.errorCode) {
                _self._$dialog({
                    dialogObj: {
                        title: '提示',
                        type: 'error',
                        content: res.data.msg,
                        mainBtn: '确定',
                        mainFn() {
                            this.$router.push('userinfo');
                        }
                    }
                });
            } else if (!isEmpty(res.data)) {
                _self._$dialog({
                    dialogObj: {
                        title: '开店提示',
                        type: 'info',
                        content: '您的账户已有店铺，不能继续开店！',
                        mainBtn: '管理我的店铺',
                        mainFn() {
                            toCMS('cms_home');
                        }
                    }
                });
            } else {
                cb && cb();
            }
        });
    }

    /**
     * 查询所有学校的名称
     */
    queryAllSchool() {
        let _self = this;
        this._$service.queryAllSchool().then((res) => {
            let data = res.data.data;
            for (let i = 0, len = data.length; i < len; i++) {
                _self.schoolList.push(data[i]);
            }
        });
    }

    /**
     * to next
     */
    toCreateShop() {
        let _self = this;
        if (_self.schoolIndex) {
            let school = _self.schoolList[_self.schoolIndex];
            let incode = this.$route.query.incode;
            let query = {
                incode: incode,
                school: school.name,
                campusId: school.campusId
            }
            _self.$router.push({ path: 'apply_shop_invitecode', query: query });
        } else {
            this.tipPopup();
        }
    }

    /**
     * 没有邀请码,随机取一个有效邀请码
     */
    tipPopup() {
        let _self = this;
        _self._$dialog({
            dialogObj: {
                title: '提示',
                type: 'error',
                content: '请选择开店学校！',
                assistBtn: '',
                mainBtn: '确定',
                mainFn() {
                }
            }
        });
    }

}
