import { Component, Prop, Vue } from 'vue-property-decorator';
import { merge, isObject, find } from 'lodash';

import { getAreasData, getZoneData, timeout } from 'common.env';

import Swiper from 'swiper';

import service from './address.service';

import './address.scss';

// ==>
@Component({
    template: require('./address.html')
})
export class Address extends Vue {
    type = 'create';
    item = {};
    title = '新增收货地址';//
    saveText = '保存';
    formstate = {};
    formScope = { name: '', phone: '', address: '', zipCode: '', isDefault: 0, province: '', city: '', district: '' };
    proviceList = [];
    cityList = [];
    districtList = [];
    schoolList = [];
    floorList = [];
    _$service;
    swiper;
    data() {
        return {};
    }
    mounted() {
        this._$service = service(this.$store);

        this.$nextTick(() => {
            document.title = this.title;
            this.initPage();
        });
    }
    async initPage() {
        this.schoolList = await this._$service.querySchoolZone();
        this.proviceList = await getAreasData();
        let _params = this.$route.query;
        this.type = _params.type;
        let _scope = this.formScope;
        if (this.type === 'update') {
            let _item = _params.item;
            if (!isObject(_item)) {
                _item = JSON.parse(sessionStorage.___addressItem || null) || {};
            } else {
                sessionStorage.___addressItem = JSON.stringify(_item);
            }
            this.title = '修改收货地址';
            this.saveText = '保存修改';
            _scope.addrId = _item.addrId;
            _scope.name = _item.name;
            _scope.phone = _item.phone;
            _scope.address = _item.address;
            _scope.zipCode = _item.zipCode;
            _scope.isDefault = _item.isDefault;
            let _result = await getZoneData(_item);
            this.cityList = _result.province.ch;
            this.districtList = _result.city.ch;
            _scope.province = _result.province.co;
            _scope.city = _result.city.co;
            _scope.district = _result.district.co;
            // 修正详细地址文本域的默认值高度不凸显
            timeout(() => {
                let _arearef = this.$refs.textareaRef;
                if (_arearef) {
                    _arearef.style.height = _arearef.scrollTop + _arearef.scrollHeight + "px";
                } else {
                    timeout(() => {
                        _arearef = this.$refs.textareaRef;
                        _arearef.style.height = _arearef.scrollTop + _arearef.scrollHeight + "px";
                    }, 100);
                }
            });
        }else{
            _scope.province = '510000';
            _scope.city = '510100';
            // this.cityList = find(this.proviceList, {co: '510000'}).ch;
        }
    }
    queryZone() {
        this._$service.querySchoolZone();
    }
    /**
     * 省份选择
     * @param event
     */
    changeProvinceAddress(event) {
        let _self = this;
        let _form = _self.formScope;
        let _target = event.target;
        let _index = _target.selectedIndex;
        if (_index) {
            let data = _self.proviceList[_index - 1];
            if (data && data.ch) {
                _self.cityList = data.ch;
            } else {
                _self.cityList = [];
            }
            _form.city = '';
            _self.districtList = [];
            _form.district = '';
        } else {
            _self.cityList = [];
            _form.city = '';
            _self.districtList = [];
            _form.district = '';
        }
    }
    /**
     * 城市选择
     * @param event
     */
    changeCityAddress(event) {
        let _self = this;
        let _form = _self.formScope;
        let _target = event.target;
        let _index = _target.selectedIndex;
        if (_index) {
            let data = _self.cityList[_index - 1];
            if (data && data.ch) {
                _self.districtList = data.ch;
            } else {
                _self.districtList = [];
            }
            _form.district = '';
        } else {
            _self.districtList = [];
            _form.district = '';
        }
    }
    // 切换地址默认checkbox
    switchDefault(event) {
        let _scope = this.formScope;
        _scope.isDefault = event.target.checked ? 1 : 0;
    }
    saveData() {
        let _toast = this.$store.state.$toast;
        let _formstate = this.formstate;
        let _dialog = this.$store.state.$dialog;
        if (_formstate.$invalid) {
            return;
        }
        let _scope = this.formScope;
        let data = merge({}, _scope, true);
        data.province = _scope.province;
        data.city = _scope.city;
        data.district = _scope.district;
        let _result = null;
        let _msg = '新增成功！';
        if (this.type === 'update') {
            _msg = '更新成功！';
            _result = this._$service.updateAddress(data);
        } else {
            _result = this._$service.createAddress(data);
        }
        _result.then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                _toast({ title: _result.msg, success: false });
            } else {
                this.close();
                timeout(() => {
                    _toast({ title: _msg });
                }, 100);
            }
        });
    }
    delData() {
        let _scope = this.formScope;
        let _toast = this.$store.state.$toast;
        this._$service.deleteAddress({ addrId: _scope.addrId }).then((res) => {
            let _result = res.data;
            if (_result.errorCode) {
                _toast({ title: '删除失败！', success: false });
            } else {
                this.close();
                timeout(() => {
                    _toast({ title: '删除成功！' });
                }, 100);
            }
        });
    }
    maxMe(e) {
        let _target = e.target;
        if (_target.value.length <= _target.maxLength) {
            _target.style.height = _target.scrollTop + _target.scrollHeight + "px";
        }
    }
    close() {
        this.$router.back();
    }
    destroyed() {
        sessionStorage.removeItem('___addressItem');
    }
}
