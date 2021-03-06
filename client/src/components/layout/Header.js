import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';
import loadjs from 'loadjs';
import { Link } from 'react-router-dom';
import { setToggleStatus } from "../../actions/custom";

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
class Header extends Component {
  state = {
    username: '',
    userType: '',
    id: '',
    avatar: '',
    dropdownOpen: false,
  };

  componentDidMount() {
    loadjs(`/assets/vendors/js/core/jquery-3.2.1.min.js`);
    loadjs(`/assets/vendors/js/core/popper.min.js`);
    loadjs(`/assets/vendors/js/core/bootstrap.min.js`);
    loadjs(`/assets/vendors/js/perfect-scrollbar.jquery.min.js`);
    loadjs(`/assets/vendors/js/prism.min.js`);
    loadjs(`/assets/vendors/js/jquery.matchHeight-min.js`);
    loadjs(`/assets/vendors/js/screenfull.min.js`);
    loadjs(`/assets/vendors/js/pace/pace.min.js`);
    loadjs(`/assets/js/app-sidebar.js`);
    loadjs(`/assets/js/notification-sidebar.js`);
    loadjs(`/assets/js/customizer.js`);
    loadjs(`/assets/js/view_product.js`);
    const { user } = this.props.auth;
    if (user != undefined) {
      this.setState({
        username: user.username,
        userType: user.type,
        id: user._id,
        avatar: user.avatar,
      });
    }
  }
  setDropdownOpen = (e) => {
    e.preventDefault();
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };
  toggleSideBar = (e) => {
    this.props.setToggleStatus(e.target.checked);
  }

  render() {
    const { user } = this.props.auth;

    return (
      <>
        <div className="menuBarToggleButton">
          <input name="toggleSideBarStatus" checked={this.props.toggleBarStatus} type="checkbox" id="menuToggler" className="input-toggler" onClick={(e) => this.toggleSideBar(e)} />
          <label htmlFor="menuToggler" className="menu-toggler">
            <span className="menu-toggler__line"></span>
            <span className="menu-toggler__line"></span>
            <span className="menu-toggler__line"></span>
          </label>
        </div>
        {user && user.avatar ? (
          <ButtonDropdown
            isOpen={this.state.dropdownOpen}
            toggle={(e) => this.setDropdownOpen(e)}
            style={{ float: 'right', marginTop: '10px' }}
          >
            <DropdownToggle caret color='white'>
              <img
                className='mr-2'
                style={{ height: '40px', borderRadius: '50px' }}
                src={user && user.avatar && user && user.avatar}
                alt={'User'}
              />
              {user && user.fullname && user && user.fullname}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                {' '}
                <Link
                  to={this.state.id ? `/user/edituser/${this.state.id}` : ''}
                  className='dropdown-item py-1'
                >
                  <i className='ft-edit mr-2'></i>
                  <span>Thông Tin Cá Nhân</span>
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Link
                  to='/'
                  onClick={() => this.props.logout()}
                  className='dropdown-item'
                >
                  <i className='ft-power mr-2'></i>
                  <span>Đăng Xuất</span>
                </Link>
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        ) : (
          ''
        )}
      </>
    );
  }
}

Header.propTypes = {
  logout: PropTypes.func.isRequired,
  setToggleStatus: PropTypes.func.isRequired,
  auth: PropTypes.object,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  toggleBarStatus: state.custom.toggleStatus
});

export default connect(mapStateToProps, { logout, setToggleStatus })(Header);
