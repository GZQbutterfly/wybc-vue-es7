import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

import './about.scss';
@Component({
    template: require('./about.html'),
})
export class About extends BaseVue {
    mounted () {
        document.title="关于我们";
    }
}