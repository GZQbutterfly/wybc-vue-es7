// VIP 等级  升级，降级，保级 相关逻辑
/**
 * 1，用户vip数据： vip信息，保级数据，晋级数据，特权折扣
 * currentGrade{}; gradeClass  grade  gradeName userName userImg status
 * 2，vip数据： 保级规则数据，折扣数据
 */
import { timeout, match } from 'common.env';
import { merge, get, isEmpty, find, set } from 'lodash';

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
            _current.infoId = _wdVipInfo.infoId;
            _current.grade = _wdVipInfo.wdVipGrade;
            set(result, 'vipInfo.__grade', _current.grade);
            // 请求vip list
            vm._$service.queryAllGrade().then((gradeList) => {
                _self.setGradeList(vm, _current, gradeList);
            });
            
            _self.parse(vm, result);
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
        let _gradeData = _wdVipInfo || (_vGradeNum > _current.grade ? _current.upData : _current.nowData);

        _self.setGradeData(vm, _gradeData, result);

        // 分析等级VIP数据
        // 目前只分析 vipN vipN+1
        if (match(_vGradeNum, [_cGradeNum, _cGradeNum + 1])) {
            _self.parseGradeData(vm, _vipInfo);
        }
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
                        // _newItem.msg = '保底任务未达成';
                    }
                }
            } else {
                _newItem.src = _gradObj.vipImgNot;
                if (_vipGrade - 1 == _grade) {
                    // _newItem.msg = '立刻晋级';
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
        let _discount = get(result, 'discount') || {};
        vm.gradeData.tqData = {
            discount: `${_discount}%`,
        };
        
        let _vipGrade = result.vipInfo.__grade;
        vm.gradeData.grade = _vipGrade;
        vm.gradeData.gradeName = vipNames[_vipGrade];
    },
    /**
     *  分析vip数据，判断是否达成条件
     */
    parseGradeData(vm, vipInfo) {
        
    },
    /**
     * 当前vip保级状态
     */
    setTjInfo(vm, vipInfo) {
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
                _self.parse(vm, result);
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
