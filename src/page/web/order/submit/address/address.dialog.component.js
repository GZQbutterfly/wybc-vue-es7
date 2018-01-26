import {Component} from 'vue-property-decorator';
import Vue from 'vue';
import addressDialogService from './address.dialog.service';
import {get, merge, find, orderBy} from 'lodash';
import {getZoneData, timeout} from 'common.env';
import Swiper from 'swiper';
import './address.dialog.component.scss';

@Component({
    props: {
        close: {
            type: Function,
            default: () => {}
        },
        selectAddress: {
            type: Function,
            default: () => {}
        },
        selectId: {
            type: [
                String, Number
            ],
            default: ''
        }
    },
    template: require('./address.dialog.component.html')
})

export class AddressDialogComponent extends Vue {
    showDialogMode = true;
    showAddressDiaogContent = false;
    showAddAddress = false;
    type = 'create';
    addressList = [];
    activeItem = {};
    _$service;

    mounted() {
        this._$service = addressDialogService(this.$store);
        this.$nextTick(() => {
            localStorage.____addressBack = '11';
            this.queryAddressList();
            this.showAddressDiaogContent = true;
        });
    }

    renderSwiper() {
        let _self = this;
        let _dialogRef = _self.$refs.dialogRef
        _self.swiper = new Swiper(_dialogRef.querySelector('.swiper-container'), {
            direction: 'vertical',
            slidesPerView: 'auto',
            freeMode: true,
            autoHeight: true,
            observer: true,
            scrollbar: {
                el: '.swiper-scrollbar'
            }
        });
    }

    async queryAddressList() {
        let _self = this;
        this._$service.queryAddressList().then(async function(res) {
            let _addressList = get(res, 'data.data');
            _addressList.sort((a, b) => b.isDefault - a.isDefault);
            if (_addressList.length) {
                for (let i = 0, len = _addressList.length; i < len; i++) {
                    let _address = _addressList[i];
                    if(_address.campus){
                        _address.addressInfo = {
                            campus: _address.campus,
                            dormitory: _address.dormitory
                        }
                    }else{
                        _address.addressInfo =await getZoneData(_address);
                    }

                    if (_self.selectId) {
                        _address._active = _self.selectId === _address.addrId;
                    } else {
                        if (_address.isDefault === 1) {
                            _address._active = true;
                        }
                    }
                }
            }
            _self.$nextTick(() => {
                _self.addressList = _addressList;
                timeout(() => {
                    _self.renderSwiper();
                });
            });
        });
    }

    closeDialog() {
        let _self = this;
        this.showDialogMode = false;
        this.showAddressDiaogContent = false;
        setTimeout(() => {
            _self.close();
        }, 500);
    }

    toCreate() {
        this.$router.push({
            path: 'address',
            query: {
                type: 'create'
            }
        });
    }
    
    toUpdate(item) {
        this.$router.push({
            path: 'address',
            query: {
                type: 'update',
                item
            }
        });
    }
}
