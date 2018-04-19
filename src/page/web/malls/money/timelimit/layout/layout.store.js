import { merge } from 'lodash';

export default {
    state: {
        defaultToast: { title: '设置成功', content: '我们将在活动开始前5分钟消息提醒您，可在“我的提醒”中查看', show: false },
        toast: { title: '设置成功', content: '我们将在活动开始前5分钟消息提醒您，可在“我的提醒”中查看', show: false }
    },
    mutations: {
        showSetRemindToast(state, msgOps) {
            let _toast = { ...state.defaultToast };
            if (msgOps) {
                if (msgOps.title) {
                    _toast.title = msgOps.title;
                }
                if (msgOps.content) {
                    _toast.content = msgOps.content;
                }
                if (msgOps.minute) {
                    _toast.content = _toast.content.replace(/\d/, msgOps.minute);
                }
            }
            merge(state.toast , _toast);
            state.toast.show = true;
            setTimeout(() => {
                state.toast.show = false;
            }, 1800);
        }
    },
    getters: {
      
    }
}