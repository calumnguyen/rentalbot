import React, { Component } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getAllUsers,
  deleteUser,
  blockUser,
  findUsers,
} from '../../../actions/user';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Alert from '../../layout/Alert';
import Loader from '../../layout/Loader';

import { OCAlertsProvider } from '@opuscapita/react-alerts';
import { OCAlert } from '@opuscapita/react-alerts';

class ViewUser extends Component {
  state = {
    activeUsers: false,
    inactiveUsers: false,
    users: '',
    activeuser: '',
    allusers: true,
    usernamesArr: '',
    emailArr: '',
  };

  async componentDidMount() {
    this.getUsers();
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 sec
    this.getUsers(); // getting users again for updated image in case of edit
  }

  async getUsers() {
    await this.props.getAllUsers();
    let usernames = [];
    let emails = [];
    const { users } = this.props;
    if (users) {
      this.setState({
        users: users,
      });
      users.filter((user) => {
        usernames.push(user.username);
      });
      users.filter((user) => {
        emails.push(user.email);
      });
      this.setState({
        usernamesArr: usernames,
        emailArr: emails,
      });
    }
  }

  getTAble = () => {
    const { auth } = this.props;
    const auth_user = auth.user;
    const { users } = this.state;
    if (users) {
      if (users.length === 0) {
        return (
          <tr>
            <td colSpan={9} className='text-center'>
              Không tìm thấy tài khoản nào :-(
            </td>
          </tr>
        );
      }
      return users.map((user) => (
        <tr key={user._id}>
          <td className='text-center'>
            <img
              className='media-object round-media'
              src={user.avatar}
              alt='Ảnh Đại Diện'
              height={75}
            />
          </td>
          <td className='text-center'>{user.userID}</td>

          <td className='text-center'>{user.fullname}</td>
          <td className='text-center'>{user.jobTitle}</td>
          <td className='text-center'>{user.systemRole}</td>
          <td className='text-center'>
            {user.accountStatus === 'active' && (
              <span className='badge badge-success'>Hoạt Động</span>
            )}
            {user.accountStatus === 'inactive' && (
              <span className='badge badge-warning'>Không Hoạt Động</span>
            )}
          </td>
          <td className='text-center'>
            {/* <Link
              to={{ pathname: `/user/view/${user._id}` }}
              className="info p-0">
              <i className="ft-user font-medium-3 mr-2" title="View Profile"></i>
            </Link> */}
            {auth_user && auth_user.systemRole === 'Admin' ? (
              <Link
                to={{ pathname: `/user/edituser/${user._id}` }}
                className='success p-0'
              >
                <i
                  className='ft-edit-3 font-medium-3 mr-2 '
                  title='Xem và Cập Nhật Thông Tin'
                ></i>
              </Link>
            ) : (
              ''
            )}
            {auth_user && auth_user.systemRole === 'Admin' ? (
              <Link
                to='/user'
                onClick={() => this.onDelete(user._id)}
                className='danger p-0'
              >
                <i
                  className='ft-x font-medium-3 mr-2'
                  title='Xoá Tài Khoản'
                ></i>
              </Link>
            ) : (
              ''
            )}
          </td>
        </tr>
      ));
    }
  };

  handleChange = () => {
    const { users } = this.props;
    const activeUsers = users.filter((a) => a.accountStatus === 'active');
    this.setState({
      allusers: false,
      inactiveUsers: false,
      activeUsers: true,
      users: activeUsers,
    });
  };
  handleChange_Inactive = () => {
    const { users } = this.props;
    const inactiveUsers = users.filter((a) => a.accountStatus === 'inactive');
    this.setState({
      activeUsers: false,
      allusers: false,
      inactiveUsers: true,
      users: inactiveUsers,
    });
  };

  handleChange_alluser = () => {
    const { users } = this.props;
    this.setState({
      activeUsers: false,
      inactiveUsers: false,
      allusers: true,
      users: users,
    });
  };

  onDelete = (id) => {
    if (this.props.users.length === 1) {
      OCAlert.alertError(
        'Lỗi Hệ Thống: không thể xoá tài khoản này. Vui lòng thử lại sau!',
        { timeOut: 5000 }
      );
      return;
    }
    confirmAlert({
      title: 'Xoá Tài Khoản',
      message: 'Bạn có chắc chắn muốn xoá tài khoản này?',
      buttons: [
        {
          label: 'Có, xoá tài khoản',
          onClick: () => {
            this.props.deleteUser(id);
          },
        },
        {
          label: 'Không, đừng xoá tài khoản',
          onClick: () => {},
        },
      ],
    });
  };

  onBlock = (id) => {
    confirmAlert({
      title: 'Khoá Tài Khoản',
      message: 'Bạn có chắc chắn muốn khoá tài khoản này?',
      buttons: [
        {
          label: 'Có, khoá tài khoản',
          onClick: () => {
            this.props.blockUser(id);
          },
        },
        {
          label: 'Không, đừng khoá tài khoản',
          onClick: () => {},
        },
      ],
    });
  };

  render() {
    const { auth } = this.props;
    if (!auth.loading && !auth.isAuthenticated) {
      return <Redirect to='/login' />;
    }
    const { user } = auth;

    if (user && user.systemRole === 'Employee') {
      return <Redirect to='/Error' />;
    }

    return (
      <React.Fragment>
        <Loader />
        <div className='wrapper menu-collapsed'>
          <Sidebar location={this.props.location}></Sidebar>
          <Header></Header>
          <div className='main-panel'>
            <div className='main-content'>
              <div className='content-wrapper'>
                <section id='simple-table'>
                  <div className='row'>
                    <div className='col-sm-12'>
                      <div className='card'>
                        <div className='card-header'>
                          <h4 className='card-title'>Nhân Viên</h4>
                        </div>
                        <div className='card-content'>
                          <div className='card-body'>
                            <div className='row'>
                              <div className='col-md-8'>
                                <label
                                  className='radio-inline'
                                  style={{ marginLeft: '10px' }}
                                >
                                  <input
                                    type='radio'
                                    name='activeUser'
                                    checked={this.state.allusers}
                                    onChange={(e) =>
                                      this.handleChange_alluser(true)
                                    }
                                    checked={this.state.allusers === true}
                                  />{' '}
                                  Mọi Tài Khoản
                                </label>
                                <label
                                  className='radio-inline'
                                  style={{ marginLeft: '10px' }}
                                >
                                  <input
                                    type='radio'
                                    name='activeUser'
                                    checked={this.state.activeUsers}
                                    onChange={(e) => this.handleChange(true)}
                                    checked={this.state.activeUsers === true}
                                  />{' '}
                                  Tài Khoản Đang Hoạt Động
                                </label>
                                <label
                                  className='radio-inline'
                                  style={{ marginLeft: '10px' }}
                                >
                                  <input
                                    type='radio'
                                    name='InactiveUser'
                                    checked={this.state.inactiveUsers}
                                    onChange={(e) =>
                                      this.handleChange_Inactive(true)
                                    }
                                    checked={this.state.inactiveUsers === true}
                                  />{' '}
                                  Tài Khoản Hết Hoạt Động
                                </label>
                              </div>

                              <div className='col-md-4'>
                                <Link
                                  to={{
                                    pathname: '/user/adduser',
                                    state: {
                                      usernamesArr: this.state.usernamesArr,
                                      emailArr: this.state.emailArr,
                                    },
                                  }}
                                  className='btn btn-primary pull-right'
                                >
                                  <i className='fa fa-plus'></i> Tạo Tài Khoản
                                  Mới
                                </Link>
                              </div>
                            </div>
                            <Alert />
                            <OCAlertsProvider />
                            <table className='table'>
                              <thead>
                                <tr>
                                  <th className='text-center'>Ảnh Đại Diện</th>
                                  <th className='text-center'>Mã Nhân Viên</th>
                                  <th className='text-center'>Họ & Tên</th>
                                  <th className='text-center'>Chức Danh</th>
                                  <th className='text-center'>Cài Đặt</th>
                                  <th className='text-center'>Trạng Thái</th>
                                  <th className='text-center'>Xem/Cập Nhật</th>
                                </tr>
                              </thead>
                              <tbody>{this.getTAble()}</tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <footer className='footer footer-static footer-light'>
            <p className='clearfix text-muted text-sm-center px-2'>
              <span>
                Quyền sở hữu của &nbsp;{' '}
                <a
                  href='https://www.sutygon.com'
                  rel='noopener noreferrer'
                  id='pixinventLink'
                  target='_blank'
                  className='text-bold-800 primary darken-2'
                >
                  SUTYGON-BOT{' '}
                </a>
                , All rights reserved.{' '}
              </span>
            </p>
          </footer>
        </div>
      </React.Fragment>
    );
  }
}

ViewUser.propTypes = {
  getAllUsers: PropTypes.func.isRequired,
  auth: PropTypes.object,
  deleteUser: PropTypes.func.isRequired,
  blockUser: PropTypes.func.isRequired,
  findUsers: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  users: state.user.users,
  auth: state.auth,
});
export default connect(mapStateToProps, {
  getAllUsers,
  deleteUser,
  blockUser,
  findUsers,
})(ViewUser);
