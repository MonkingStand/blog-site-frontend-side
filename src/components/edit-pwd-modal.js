import React, { memo, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updatePwd } from 'actions';
import { stanAlert } from 'lib';

const Header = memo(function Mod() {
    return (
        <div className="modal-header">
            <h5 className="modal-title">
                Modify Your Password
            </h5>
            <a
                className="btn close"
                data-dismiss="modal"
                aria-label="Close"
            >
                <i className="fa fa-times" aria-hidden="true"></i>
            </a>
        </div>
    );
}, (prevProps, nextProps) => Boolean('CONSTANT_PROPS')); // eslint-disable-line
const Body = function(props) {
    const { pwdForm, setPwdForm } = props;
    const formChangeHandler = (evt, key) => {
        const tmpPwdForm = Object.assign({}, pwdForm);

        tmpPwdForm[key] = (evt.target.value).trim();
        setPwdForm(tmpPwdForm);
    };

    return (
        <div className="modal-body">
            <form id="editPwdForm">
                <div className="form-group">
                    <label htmlFor="editPwd_original">
                        original password
                    </label>
                    <input
                        id="editPwd_original"
                        className="form-control"
                        type="password"
                        placeholder="type your original pwd"
                        onChange={ event => formChangeHandler(event, 'original') }
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="editPwd_new">
                        new password
                    </label>
                    <input
                        id="editPwd_new"
                        className="form-control"
                        type="password"
                        placeholder="type your new pwd"
                        onChange={ event => formChangeHandler(event, 'modify') }
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="editPwd_confirm">
                        confirm new password
                    </label>
                    <input
                        id="editPwd_confirm"
                        className="form-control"
                        type="password"
                        placeholder="confirm your new pwd"
                        onChange={ event => formChangeHandler(event, 'confirm') }
                    />
                </div>
            </form>
        </div>
    );
};
const Footer = function(props) {
    const { pwdForm } = props;
    const submitValidate = formData => {
        const pwdReg = /^\S{10,18}$/;
        const alertInfo = {
            title: 'Warning!',
            original: {
                null: 'please type the original pwd!',
                illegal: 'please type legal pwd!<br/>pwd length from 10 to 16.',
            },
            modify: {
                null: 'please type the new pwd!',
                illegal: 'please type legal pwd!<br/>pwd length from 10 to 16.',
            },
            confirm: {
                null: 'please retype the pwd to check!',
                illegal: 'the pwd to confirm is inconsistent!'
            }
        };

        if (!formData.original) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.original.null,
            });

            return false;
        } else if (!pwdReg.test(formData.original)) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.original.illegal,
            });

            return false;
        } else if (!formData.modify) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.modify.null
            });

            return false;
        } else if (!pwdReg.test(formData.modify)) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.modify.illegal,
            });

            return false;
        } else if (!formData.confirm) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.confirm.null,
            });

            return false;
        } else if (formData.modify !== formData.confirm) {
            stanAlert({
                title: alertInfo.title,
                content: alertInfo.confirm.illegal,
            });

            return false;
        }

        return true;
    };
    const submitForm = (evt) => { // eslint-disable-line
        if (submitValidate(pwdForm || {})) {
            updatePwd(pwdForm);
        }
    };

    return (
        <div className="modal-footer">
            <a onClick={ event => submitForm(event) } className="btn btn-primary submit-btn">
                Submit
            </a>
        </div>
    );
};
const UI_EditPwdModal = function() {
    const [pwdForm, setPwdForm] = useState({
        original: '',
        modify: '',
        confirm: '',
    });

    return (
        <div
            id="editPwdModal"
            className="common-modal modal fade"
            tabIndex="-1"
            role="dialog"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <Header/>
                    <Body pwdForm={ pwdForm } setPwdForm={ setPwdForm }/>
                    <Footer pwdForm={ pwdForm }/>
                </div>
            </div>
        </div>
    );
};
const mapState2Props = (state, props) => state.appReducer; // eslint-disable-line
const mapDispatch2Props = () => ({});
let EditPwdModal;

Body.propTypes = {
    pwdForm: PropTypes.object,
    setPwdForm: PropTypes.func.isRequired,
};
Footer.propTypes = {
    pwdForm: PropTypes.object,
};

EditPwdModal = connect(
    mapState2Props,
    mapDispatch2Props
)(UI_EditPwdModal);

export default EditPwdModal;