// 404 Not Found Page
import { Component } from 'vue-property-decorator';
import BaseVue  from 'base.vue';





import './notfound.scss';
@Component({
    template: require('./notfound.html')
})
export class NotFound extends BaseVue {


    mounted () {
        this.$nextTick(()=>{

        });
    }

    toHome() {
        this.$router.push('/');
    }
}
