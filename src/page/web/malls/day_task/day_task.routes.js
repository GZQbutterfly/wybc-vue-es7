const routes = [
    {
        path: '/day_task',
        name: 'day_task',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./task/task')['DayTask']);
            }, 'malls/day_task/day_task');
        },
    },
    {
        path: '/day_task_share',
        name: 'day_task_share',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./share/share')['DayTaskShare']);
            }, 'malls/day_task/day_task');
        },
    },
    {
        path: '/day_task_rules',
        name: 'day_task_rules',
        component: resolve => {
            require.ensure([], require => {
                resolve(require('./rules/rules')['DayTaskRules']);
            }, 'malls/day_task/day_task');
        },
    }
];
export default routes;