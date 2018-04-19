// VIP等级页面
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { getLocalUserInfo, timeout, interval, match } from 'common.env';

import { CircleComponent } from './circle/circle.component';

import Swiper from 'swiper';

import gradeController from './grade.controller';
import service from './grade.service';

import './grade.scss';
@Component({
    template: require('./grade.html'),
    components: {
        'app-circle': CircleComponent
    }
})
export class Grade extends BaseVue {
    currentGrade = {}; // gradeClass  grade  gradeName userName userImg
    gradeData = { tqData: {}, tjList: [], showContent: false };
    gradeList = [];
    status = '';
    gradeActive = '';
    showTjContent = false;
    _$service;
    _user;
    data() {
        return {};
    }
    mounted() {
        let _self = this;
        // 注册服务
        _self._$service = service(_self.$store);
        // 页面执行
        _self.$nextTick(() => {
            document.title = '店长等级';
            _self.setUser();
        })
    }
    // 设置用户信息
    setUser() {
        let _self = this;
        let _user = getLocalUserInfo();
        _self._user = _user;
        _self.currentGrade.userImg = _user.headimgurl || '/static/images/pic-login.png';
        _self.currentGrade.userName = _user.nickname;
        gradeController.queryCurrentGrade(this);
    }
    // 渲染用户VIP轮播
    rendergradeSwiper() {
        let _self = this;
        _self.swiper = new Swiper(_self.$refs.gradeSwiper, {
            // slidesOffsetBefore: _self.gradeList.length >= 4 ? 45 : 0,
            slidesPerView: 4,
            slidesPerColumn: 1,
            slidesPerGroup: 4,
            freeMode: true,
            observer: true,
            setWrapperSize: true,
            roundLengths: true,
            direction: 'horizontal',
            on: {
                init() {
                    timeout(() => {
                        if (_self.gradeActive > 4) {
                            this.slideTo(_self.gradeActive - 1);
                        } else if (_self.gradeActive <= 4) {
                            this.slideTo(_self.gradeActive);
                        }
                    }, 50);
                }
            }
        });
    }
    // 切换等级轮播触发 该等级数据加载
    switchgrade(event, item) {
        let _self = this;
        if (_self.gradeActive === item.grade) {
            return;
        }
        if (_self.status === 'lock') {
            _self.$store.state.$dialog({
                dialogObj: {
                    title: '提示',
                    type: 'error',
                    content: '您当前等级已锁定，无法查看其他等级信息！',
                    mainBtn: '知道啦',
                    mainFn() { }
                }
            });
            return;
        }
        _self.gradeActive = item.grade;
        _self.gradeData.reachedImg = '';
        _self.showTjContent = false;
        // 请求点击的等级数据
        timeout(() => {
            gradeController.queryGradeData(_self, { grade: item.grade });
        });
    }
    
    toGuide() {
        this.$router.push('grade_guide');
    }
    doUnLock() {
        let _self = this;
        _self._$service.unlock({ infoId: _self.currentGrade.infoId }).then((_result) => {
            if (_result.errorCode) {
                _self.tipDialog(_result.msg, 'error');
            } else {
                let msg = _result.isUnlocked ? '解锁成功!' : '解锁失败!';
                _self.tipDialog(msg);
                gradeController.queryCurrentGrade(_self);
            }
        })
    }
    tipDialog(msg, type = 'info') {
        this.$store.state.$dialog({
            dialogObj: {
                title: '提示',
                type: type,
                content: msg,
                mainBtn: '知道啦',
                mainFn() { }
            }
        });
    }
}
