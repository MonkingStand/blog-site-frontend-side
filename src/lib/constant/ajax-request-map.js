const GET = 'GET';
const POST = 'POST';
const ajaxRequestMap = {
    util: {
        uploadFile: {
            url: '/util/upload-file', type: POST
        }
    },
    message: {
        page: {
            url: '/api/message/page', type: GET
        }
    },
    user: {
        default: {
            url: '/api/user/default', type: GET
        },
        login: {
            url: '/api/user/login', type: POST
        },
        logout: {
            url: '/api/user/logout', type: POST
        },
        register: {
            url: '/api/user/register', type: POST
        },
        sendActivateMail: {
            url: '/api/user/send-activate-mail', type: POST
        },
        activate: {
            url: '/api/user/activate', type: POST
        },
        updateInfo: {
            url: '/api/user/update-info', type: POST
        },
        updatePwd: {
            url: '/api/user/update-pwd', type: POST
        },
        resetPwd: {
            url: '/api/user/reset-pwd', type: POST
        },
    },
    paper: {
        filterCount: {
            url: '/api/paper/filter-count', type: GET
        },
        detail: {
            url: '/api/paper/:paperId', type: GET
        },
    },
    catalogue: {
        page: {
            url: '/api/catalogue/page', type: GET
        }
    },
    reply: {
        list: {
            url: '/api/reply', type: GET
        },
        create: {
            url: '/api/reply/create', type: POST
        },
        update: {
            url: '/api/reply/:id/update', type: POST
        },
        delete: {
            url: '/api/reply/:id/delete', type: POST
        }
    },
    admin: {
        paper: {
            create: {
                url: '/api/admin/paper/create', type: POST
            },
            update: {
                url: '/api/admin/paper/:id/update', type: POST
            },
        },
    }
};

export default ajaxRequestMap;