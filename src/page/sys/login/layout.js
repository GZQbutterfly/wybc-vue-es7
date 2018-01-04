import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';

import { Login } from './login';

import './layout.scss';
@Component({
    template: require('./layout.html'),
    components: {
        'wybc-login': Login
    }
})
export class LoginLayout extends BaseVue {


    loginName = 'wybc';


    mounted() {

    }

}
