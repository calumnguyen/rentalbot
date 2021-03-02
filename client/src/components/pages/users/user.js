import React, { Component } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAllUsers, deleteUser, blockUser } from '../../../actions/user';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Alert from '../../layout/Alert';
import Loader from '../../layout/Loader';

class ViewUser extends Component {
  async componentDidMount() {
    await this.props.getAllUsers();
  }

  getTAble = () => {
    const { auth } = this.props;
    const auth_user = auth.user;
    const { users } = this.props;
    let tbl_sno = 1;
    if (users) {
      if (users.length === 0) {
        return (
          <tr>
            {/* <td colSpan={} className="text-center"> */}
            {/* No User Found */}
            {/* </td> */}
          </tr>
        );
      }
      return users.map((user) => (
        <tr key={user._id}>
          <td className='text-center text-muted'>{tbl_sno++}</td>
          <td className='text-center'>
            <img
              className='media-object round-media'
              src={`${user.avatar}`}
              alt='Profile Image'
              height={75}
            />
          </td>

          <td className='text-center'>{user.username}</td>
          <td className='text-center'>{user.contactnumber}</td>
          <td className='text-center'>{user.email}</td>
          <td className='text-center'>{user.gender}</td>
          <td className='text-center'>
            {user.accountStatus === 'active' && (
              <span className='badge badge-success'>Hoạt Động</span>
            )}
            {user.accountStatus === 'block' && (
              <span className='badge badge-warning'>Khoá</span>
            )}
          </td>
          {/* <td className="text-center">{user.accountStatus}</td> */}
          <td className='text-center'>
            <Link
              to={{ pathname: `/user/view/${user._id}` }}
              className='info p-0'
            >
              <i
                className='ft-user font-medium-3 mr-2'
                title='Xem Thông Tin'
              ></i>
            </Link>
            <Link
              to={{ pathname: `/user/edituser/${user._id}` }}
              className='success p-0'
            >
              <i
                className='ft-edit-2 font-medium-3 mr-2 '
                title='Cập Nhật Thông Tin'
              ></i>
            </Link>
            <Link
              to='/user/viewuser'
              onClick={() => this.onDelete(user._id)}
              className='danger p-0'
            >
              <i className='ft-x font-medium-3 mr-2' title='Xoá'></i>
            </Link>
            {auth_user && auth_user.type === 'Admin' ? (
              <Link
                to={{ pathname: `/user` }}
                onClick={() => this.onBlock(user._id)}
                className='info p-0'
              >
                <i
                  className='ft-alert-triangle font-medium-3 mr-2'
                  title='Khoá Tài Khoản'
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

  onDelete = (id) => {
    confirmAlert({
      title: 'Xoá Tài Khoản',
      message: 'Bạn có chắc chắn muốn xoá tài khoản này không?',
      buttons: [
        {
          label: 'Có, xoá tài khoản',
          onClick: () => {
            this.props.deleteUser(id);
          },
        },
        {
          label: 'Không, đừng xoá',
          onClick: () => {},
        },
      ],
    });
  };

  onBlock = (id) => {
    confirmAlert({
      title: 'Khoá Tài Khoản',
      message: 'Bạn có chắc chắn muốn khoá tài khoản này không?',
      buttons: [
        {
          label: 'Có, khoá tài khoản',
          onClick: () => {
            this.props.blockUser(id);
          },
        },
        {
          label: 'Không, đừng khoá',
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

    // if (this.props.saved) {
    //     return <Redirect to="/dashboard" />;
    //   }

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
                          <h4 className='card-title'>Xem Thông Tin</h4>
                        </div>
                        <div className='card-content'>
                          <div className='card-body'>
                            <Alert />
                            <table className='table'>
                              <thead>
                                <tr>
                                  <th className='text-center'>Mã Nhân Viên</th>
                                  <th className='text-center'>Avatar</th>

                                  <th className='text-center'>Full Name</th>
                                  {/* <th>Last Name</th> */}
                                  <th className='text-center'>Contact</th>
                                  <th className='text-center'>E-mail</th>
                                  <th className='text-center'>Gender</th>
                                  <th className='text-center'>
                                    Account Status
                                  </th>
                                  <th className='text-center'>Actions</th>
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
};

const mapStateToProps = (state) => ({
  users: state.user.users,
  auth: state.auth,
});
export default connect(mapStateToProps, {
  getAllUsers,
  deleteUser,
  blockUser,
})(ViewUser);
