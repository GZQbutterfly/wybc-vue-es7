import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';
import Search from '../../../../commons/vue_plugins/components/search/search.vue';
// import searchService from './search_test.service';
import './search_test.scss';
@Component({
    template: require('./search_test.html'),
    components: {
        'search': Search
    }
})
export class SearchTest extends BaseVue {
    _func_search_init(){
        console.log('测试搜索事件触发');
    }
    _func_search_change(){
        console.log('测试搜索输入提示事件');
        return ['测试1','测试2','测试3','测试4'];
    }
    _func_search_getData_init(){
        console.log('测试搜索输入提示事件');
    }
}