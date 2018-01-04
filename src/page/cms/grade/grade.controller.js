// VIP 等级  升级，降级，保级 相关逻辑
/**
 * 1，用户vip数据： vip信息，保级数据，晋级数据，特权折扣
 * currentGrade{}; gradeClass  grade  gradeName userName userImg status
 * 2，vip数据： 保级规则数据，折扣数据
 */
import { getCountDown, timeout, match } from 'common.env';
import { merge, get, isEmpty, find, set } from 'lodash';

let count = 0;

let vipNames = [''];

export default {
    /**
     * 页面第一次进来请求数据，并组装数据
     * @param vm
     */
    queryCurrentGrade(vm) {
        let _self = this;
        let _current = vm.currentGrade;
        vm._$service.queryCurrentGrade().then((result) => {
            if (isEmpty(result)) { return; }
            // 用户当前等级信息
            let _wdVipInfo = result.wdVipInfo;
            // 规则数据
            let _vipInfo = result.vipInfo;
            //_wdVipInfo.wdVipGrade = 6;
            //
            _current.infoId = _wdVipInfo.infoId;
            _current.grade = _wdVipInfo.wdVipGrade;
            // _wdVipInfo.purchase =100;
            // _wdVipInfo.singleBuy =1;
            // _wdVipInfo.salesNum = 1;
            // 2，设置用户保级数据
            vm.$set(_current, 'nowData', _wdVipInfo);
            // 3, 设置用户晋级数据
            vm.$set(_current, 'upData', {
                vipGrade: _wdVipInfo.vipGrade,
                vipNum: _wdVipInfo.vipNum,
                time: _wdVipInfo.time,
                purchase: _wdVipInfo.purchase,
                singleBuy: _wdVipInfo.singleBuy,
                salesNum: _wdVipInfo.salesNum
            });
            _vipInfo.__grade = _current.grade;
            // 解析数据
            _self.parse(vm, result);
            // 请求vip list
            vm._$service.queryAllGrade().then((gradeList) => {
                _self.setGradeList(vm, _current, gradeList);
            });
            //
        });
    },
    /**
     * 解析 query vip result
     * @param vm
     * @param result
     */
    parse(vm, result) {
        let _self = this;
        let _current = vm.currentGrade;
        let _cGradeNum = _current.grade;
        let _wdVipInfo = result.wdVipInfo;
        let _vipInfo = result.vipInfo;
        let _vGradeNum = _vipInfo.__grade;
        //
        if (_vGradeNum == _current.grade) {
            _current.nowData = _wdVipInfo;
            _current.upData = {
                vipGrade: _wdVipInfo.vipGrade,
                vipNum: _wdVipInfo.vipNum,
                time: _wdVipInfo.time,
                purchase: _wdVipInfo.purchase,
                singleBuy: _wdVipInfo.singleBuy,
                salesNum: _wdVipInfo.salesNum
            };
        }
        //
        let _gradeData = _wdVipInfo || (_vGradeNum > _current.grade ? _current.upData : _current.nowData);

        _self.setTjInfo(vm, _vipInfo);
        //
        _self.setGradeData(vm, _gradeData, result);

        // 分析等级VIP数据
        // 目前只分析 vipN vipN+1
        if (match(_vGradeNum, [_cGradeNum, _cGradeNum + 1])) {
            _self.parseGradeData(vm, _vipInfo);
        }
        vm.showTjContent = true;
        vm.leaveTime = _vipInfo.time;
        vm.countDown();

    },
    setGradeList(vm, currentGrade, gradeList) {
        if (!gradeList) { return; }
        let _grade = currentGrade.grade;
        let list = [];
        for (let i = 0, len = gradeList.length; i < len; i++) {
            let _gradObj = gradeList[i];
            let _vipGrade = _gradObj.vipGrade;
            let _newItem = {
                grade: _vipGrade,
                name: _gradObj.name
            };
            vipNames.push(_gradObj.name);
            if (_vipGrade <= _grade) {
                _newItem.src = _gradObj.vipImgOk;
                if (_vipGrade == _grade) {
                    currentGrade.gradeImg = _gradObj.ribbonImg;
                    if (!vm.gradeData.isReach && vm.currentGrade.status !== 'lock') {
                        _newItem.msg = '保底任务未达成';
                    }
                }
            } else {
                _newItem.src = _gradObj.vipImgNot;
                if (_vipGrade - 1 == _grade) {
                    _newItem.msg = '立刻晋级';
                }
            }
            list.push(_newItem);
        }
        vm.gradeActive = currentGrade.grade;
        vm.gradeData.gradeName = vipNames[_grade];
        vm.gradeList = list;
        timeout(() => {
            vm.rendergradeSwiper();
        });
    },
    /**
     * set active grade data
     * @param vm
     * @param gradeData
     * @param result
     */
    setGradeData(vm, gradeData, result) {
        let _self = this;
        let tjList = [];
        let vipInfo = result.vipInfo;
        let vipGrade = vipInfo.__grade;
        let grade = vm.currentGrade.grade;
        let _gradeName = vipNames[vipGrade];
        let _status = vm.currentGrade.status;
        let _isNextOne = (vipGrade - 1 === grade);
        let _purchasePrefix = vm.gradeData.title + '进货量(元)';
        let _pyPrefix = '培养';
        let _salesPrefix = '销售订单数(单)'
        if (_status == 'lock') {
            _purchasePrefix = '累计' + _purchasePrefix;
            _pyPrefix = '累计' + _pyPrefix;
            _salesPrefix = '累计' + _salesPrefix;
        } else {
            _purchasePrefix = '当月' + _purchasePrefix;
            _salesPrefix = '当月' + _salesPrefix;
        }
        // 保底进货量(元);
        if (vipInfo.purchase) {
            tjList.push({ name: _purchasePrefix, total: vipInfo.purchase / 100, num: gradeData.purchase / 100 });
        }
        // 培养VIP
        if (vipInfo.vipNum) {
            let _num = _isNextOne ? gradeData.upVipNum : gradeData.vipNum;
            tjList.push({ name: `${_pyPrefix}${vipInfo.vipNum}个M${vipInfo.vip}`, total: vipInfo.vipNum, num: _num });
        }
        // 进货次数
        if (vipInfo.singleBuy) {
            tjList.push({ name: '进货次数', total: vipInfo.singleBuy, num: gradeData.singleBuy });
        }
        // 销售订单数(单)
        if (vipInfo.salesNum) {
            tjList.push({ name: _salesPrefix, total: vipInfo.salesNum, num: gradeData.saleNum });
        }
        vm.gradeData.grade = vipGrade;
        vm.gradeData.tjList = tjList;
        vm.gradeData.gradeName = _gradeName;
        let _discount = get(result, 'discount') || {};
        vm.gradeData.tqData = {
            discount: `${_discount.discountLow}%~${_discount.discountUp}%`,
            discountLow: _discount.discountLow,
            discountUp: _discount.discountUp
        };
        vm.gradeData.showContent = (_isNextOne || vipGrade === grade);
    },
    /**
     *  分析vip数据，判断是否达成条件
     */
    parseGradeData(vm, vipInfo) {
        let gradeData = vm.gradeData;
        let vipGrade = vipInfo.__grade;
        let grade = vm.currentGrade.grade;
        let _datas = gradeData.tjList;
        let isReach = true;
        for (let i = 0, len = _datas.length; i < len; i++) {
            let _data = _datas[i];
            _data.num = Number(_data.num) || 0;
            if (_data.num === 0 && _data.total === 0) {
                _data.value = 100;
            } else {
                let _num = _data.num < 0 ? 0 : _data.num;
                _data.value = Math.floor((_num / _data.total) * 100);
            }
            _data.value = isNaN(_data.value) ? 0 : _data.value;
            _data.value = isFinite(_data.value) ? _data.value : 0;
            //_data.value = _data.value || 80; test
            if (_data.value < 100) {
                _data.success = false;
                _data.color = '#ff6485';
                _data.fontClass = 'font-error';
                _data.result = '未达成';
                isReach = false;
            } else {
                _data.success = true;
                _data.color = '#37b6ff';
                _data.fontClass = 'font-success';
                _data.result = '已达成';
            }
            if (_data.value > 100) {
                _data.value = 100;
            }
        }
        if (vipGrade > grade) {
            gradeData.isReach = vipInfo.isUpGrade;
        } else {
            gradeData.isReach = isReach;
        }
        //gradeData.isReach = isReach;
        if (gradeData.isReach) {
            gradeData.reachedImg = '/static/images/minishop/reached.png';
        } else {
            gradeData.reachedImg = '/static/images/minishop/not_reached.png';
        }
    },
    /**
     * 当前vip保级状态
     */
    setTjInfo(vm, vipInfo) {
        let _scope = vm.currentGrade.nowData;
        let _grade = vm.currentGrade.grade;
        let _vipGrade = vipInfo.__grade;
        let _gradeData = vm.gradeData;
        // state 0 锁定  1 未锁定  2 暂停
        // 当前VIP 考核  (考核中， 考核结束， 考核暂停， 锁定)
        // checking  checkover    checkstop   lock
        let _status = '';
        _gradeData.name = '保底';
        _gradeData.title = '保底';
        if (vipInfo.time < 0) {
            // _scope.state = 0;
            vipInfo.time = 0;
        }
        switch (_scope.state) {
            case 0: // 锁定
                _status = 'lock';
                _gradeData.title = _gradeData.isReach ? '解锁' : '保底';
                break;
            case 1: // 未锁定 => 考核结束，考核中
                _status = (vipInfo.isOverTime ? 'checkover' : (vipInfo.time > 0 ? 'checking' : 'checkover'));
                break;
            case 2: // 暂停
                _status = 'checkstop';
                break;
            default:
        }
        //_status = 'checking'; //test
        if (_vipGrade != _grade) {
            _gradeData.name = '晋级';
            _gradeData.title = '晋级';
            _status = 'checkover';
        } else {
            vm.currentGrade.status = _status;
        }
        if (_status === 'lock') {
            _gradeData.title = '解锁';
        }
        _gradeData.downIncomeRate = vipInfo.punish;
        let now = new Date();
        now.setTime(now.getTime() + vipInfo.time);
        vm.reDate = now;
        vm.status = _status;
    },
    /**
     * 获取倒计时
     */
    getCountDown(vm, endDate) {
        let _result = getCountDown(endDate, 'd');
        if (_result) {
            vm.countDate = { day: _result.d, hour: _result.h, minute: _result.m, second: _result.s };
        }
    },
    /**
     * 请求 grade data 引用与点击vip卡片时请求数据
     * @param vm
     * @param data
     */
    queryGradeData(vm, data) {
        let _self = this;
        let _grade = vm.currentGrade.grade;
        let _activeGrade = data.grade;
        if (_activeGrade - 1 === _grade) {
            data.isGrading = (vm.gradeData.isReach ? '1' : '0');
            vm._$service.queryGradeData(data).then((result) => {
                set(result, 'vipInfo.__grade', data.grade);
                if (get(result, 'wdVipInfo.state') === 0) {
                    // 锁定状态则 回到最初的状态grade
                    _self.queryCurrentGrade(vm);
                } else {
                    _self.parse(vm, result);
                }
            });
        } else if (_activeGrade == _grade) {
            vm._$service.queryCurrentGrade({ vip: data.grade }).then((result) => {
                set(result, 'vipInfo.__grade', data.grade);
                _self.parse(vm, result);
            });
        } else {
            vm._$service.queryVip({ vip: data.grade }).then((result) => {
                set(result, 'vipInfo.__grade', data.grade);
                _self.parse(vm, result);
            });
        }
    }
}
