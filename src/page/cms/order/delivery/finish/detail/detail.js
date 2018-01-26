import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';


import { timeout } from 'common.env';



import './detail.scss';
@Component({
    template: require('./detail.html')
})
export class Detail extends BaseVue {

}