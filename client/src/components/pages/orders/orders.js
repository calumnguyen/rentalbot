import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Alert from '../../layout/Alert';
import '../orders/orders.css';
import Loader from '../../layout/Loader';
import {
  getAllRentedProducts,
  deleteRentedProduct,
  getOrderSearchStatus,
} from '../../../actions/rentproduct';
import { getAllProductsAll } from '../../../actions/product';
import { confirmAlert } from 'react-confirm-alert';
import * as moment from 'moment';
import 'react-confirm-alert/src/react-confirm-alert.css';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import OrderStatus from './small/Status';
import Spinner from '../../layout/Spinner.js';

class Orders extends Component {
  state = {
    status: [],
    loading: false,
    search: '',
  };

  async componentDidMount() {
    await this.props.getAllRentedProducts();
  }

  handleStatusToggle = async (name) => {
    let selectedstatus = this.state.status.indexOf(name);

    let resultant = [...this.state.status];

    if (selectedstatus === -1) {
      resultant.push(name);
    } else {
      resultant.splice(selectedstatus, 1);
    }
    this.setState({ status: resultant });

    if (resultant.length == 0) {
      // if user deselect all the elements then fetch all statuses.
      await this.props.getAllRentedProducts();
    } else {
      // is arra contains atleast 1 item then make this request.
      await this.props.getOrderSearchStatus({ status: resultant });
    }
  };

  orderTable = () => {
    const { rentproducts } = this.props;

    if (rentproducts) {
      let ordersDataArr = [];
      rentproducts.forEach((order, idx) => {
        ordersDataArr.push({
          orderNumber: order.orderNumber,
          name: order.customer ? order.customer.name : '',
          phone: order.customer ? order.customer.contactnumber : '',
          status: (
            <OrderStatus
              title={order.status}
              reservedStatus={order.reservedStatus}
              readyForPickUp={order.readyForPickUp}
              pickedUpStatus={order.pickedUpStatus}
              total={`${order.total_notes ? order.total_notes : 0} g/c`}
              remain={`${
                order.notes
                  ? order.notes.filter((i) => i.done == false).length
                  : 0
              } y/c`}
            />
          ),

          actions: (
            <>
              <Link
                to={{ pathname: `/orders/vieworder/${order._id}` }}
                className='success p-0'
              >
                <i
                  className='ft-edit-3 font-medium-3 mr-2 '
                  title='Xem Đơn Hàng'
                ></i>
              </Link>
            </>
          ),
        });
      });

      const columns = [
        {
          dataField: 'orderNumber',
          text: 'Mã Đơn Hàng',
          sort: true,
        },
        {
          dataField: 'name',
          text: 'Họ & Tên',
          sort: true,
        },
        {
          dataField: 'phone',
          text: 'SĐT',
          sort: true,
        },
        {
          dataField: 'status',
          text: 'Trạng Thái',
          sort: true,
        },
        {
          dataField: 'actions',
          text: 'Xem Đơn',
          sort: true,
        },
      ];

      const MySearch = (props) => {
        let input;
        const handleClick = () => {
          props.onSearch(input.value);
        };
        return (
          <>
            <div className='row'>
              <div className='col-md-4'>
                <input
                  className='form-control'
                  style={{ backgroundColor: 'white' }}
                  ref={(n) => (input = n)}
                  type='text'
                />
              </div>
              <div className='col-md-4'>
                <button className='btn btn-success' onClick={handleClick}>
                  <i className='fa fa-search'></i> Tìm{' '}
                </button>
              </div>
            </div>
            <div className='row '>
              {/* Pickup Today */}

              <div className='form-group col' style={{ marginTop: '-20px' }}>
                <br></br>
                <h3>
                  {' '}
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'pickup')
                          ? 'linear-gradient(to bottom right, #348F50, #56b4d3)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('pickup');
                    }}
                  >
                    Lấy Hàng Hôm Nay
                  </span>
                </h3>
              </div>

              {/* Return Today */}

              <div className='form-group col' style={{ marginTop: '-20px' }}>
                <br></br>
                <h3>
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'return')
                          ? 'linear-gradient(to bottom right, #FEAC5E, #C779D0)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('return');
                    }}
                  >
                    Trả Hàng Hôm Nay
                  </span>
                </h3>
              </div>

              {/* Alteration */}

              <div className='form-group col' style={{ marginTop: '-20px' }}>
                <br></br>
                <h3>
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'alteration')
                          ? 'linear-gradient(to bottom right, #6441A5, #2a0845)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('alteration');
                    }}
                  >
                    Có Yêu Cầu
                  </span>
                </h3>
              </div>

              {/* Pending */}
              <div className='form-group col' style={{ marginTop: '-20px' }}>
                <br></br>
                <h3 className=''>
                  {' '}
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'pending')
                          ? 'linear-gradient(to bottom right, #4ca1af, #c4e0e5)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: `${
                        this.state.status.find((s) => s == 'pending')
                          ? '#000'
                          : '#fff'
                      }`,
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('pending');
                    }}
                  >
                    Đang Xử Lý
                  </span>
                </h3>
              </div>

              {/* Ready */}

              <div className='form-group col' style={{ marginTop: '-20px' }}>
                <br></br>
                <h3>
                  {' '}
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'ready')
                          ? 'linear-gradient(to bottom right, #136a8a, #267871)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('ready');
                    }}
                  >
                    Sẵn Sàng Để Lấy
                  </span>
                </h3>
              </div>
            </div>

            <div className='row'>
              {/* Active */}

              <div className='form-group col' style={{ marginTop: '-30px' }}>
                <br></br>
                <h3>
                  {' '}
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'active')
                          ? 'linear-gradient(to bottom right, #3a7bd5, #3a6073)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('active');
                    }}
                  >
                    Đang Sử Dụng
                  </span>
                </h3>
              </div>

              {/* Completed */}
              <div className='form-group col' style={{ marginTop: '-30px' }}>
                <br></br>
                <h3>
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'Completed')
                          ? 'linear-gradient(to bottom right, #b24592, #f15f79)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('Completed');
                    }}
                  >
                    Hoàn Tất
                  </span>
                </h3>
              </div>

              {/* Overdue */}

              <div className='form-group col' style={{ marginTop: '-30px' }}>
                <br></br>
                <h3>
                  {' '}
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'overdue')
                          ? 'linear-gradient(to bottom right, #ff5f6d, #ffc371)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('overdue');
                    }}
                  >
                    Trễ Hẹn Trả Đồ
                  </span>
                </h3>
              </div>

              {/* Lost */}

              <div className='form-group col' style={{ marginTop: '-30px' }}>
                <br></br>
                <h3>
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'lost')
                          ? 'linear-gradient(to bottom right, #603813, #b29f94)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('lost');
                    }}
                  >
                    Mất
                  </span>
                </h3>
              </div>

              {/* Cancelled */}

              <div className='form-group col' style={{ marginTop: '-30px' }}>
                <br></br>
                <h3>
                  <span
                    className='py-2 btn-custom font-weight-600 badge '
                    style={{
                      cursor: 'pointer',
                      backgroundImage: `${
                        this.state.status.find((s) => s == 'cancelled')
                          ? 'linear-gradient(to bottom right, #e96443, #904e95)'
                          : 'linear-gradient(to bottom right, #000000, #434343)'
                      }`,
                      color: '#fff',
                      borderColor: '#fff',
                      borderRadius: '10px',
                    }}
                    onClick={() => {
                      this.handleStatusToggle('cancelled');
                    }}
                  >
                    Hủy Đồ
                  </span>
                </h3>
              </div>
            </div>
          </>
        );
      };

      return (
        <ToolkitProvider
          // bootstrap4
          keyField='id'
          data={ordersDataArr.length === 0 ? [] : ordersDataArr}
          columns={columns}
          // defaultSorted={defaultSorted}
          search
        >
          {(props) => (
            <div>
              <MySearch {...props.searchProps} />
              <BootstrapTable {...props.baseProps} />
              <br />
            </div>
          )}
        </ToolkitProvider>
      );
    } else {
      return <div>Chưa có đơn hàng nào</div>;
    }
  };

  render() {
    return (
      <>
        <Loader />
        <div className='wrapper menu-collapsed'>
          <Sidebar location={this.props.location}></Sidebar>
          <Header></Header>
          <div className='main-panel'>
            <div className='main-content'>
              <div className='content-wrapper'>
                <section id='extended'>
                  <div className='row'>
                    <div className='col-sm-12'>
                      <div className='card'>
                        <div className='card-header'>
                          <h4 className='card-title'>Đơn Hàng</h4>
                        </div>
                        <div className='card-content'>
                          <div className='card-body table-responsive'>
                            <Alert />
                            {this.state.loading ? (
                              <Spinner />
                            ) : (
                              this.orderTable()
                            )}
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
      </>
    );
  }
}

Orders.propTypes = {
  auth: PropTypes.object,
  getAllRentedProducts: PropTypes.func.isRequired,
  getAllProductsAll: PropTypes.func.isRequired,
  deleteRentedProduct: PropTypes.func.isRequired,
  getOrderSearchStatus: PropTypes.func.isRequired,
  rentproducts: PropTypes.array,
  products: PropTypes.array,
};

const mapStateToProps = (state) => ({
  rentproducts: state.rentproduct.rentproducts,
  auth: state.auth,
  loading: state.rentproduct.loading,
});
export default connect(mapStateToProps, {
  getAllRentedProducts,
  deleteRentedProduct,
  getAllProductsAll,
  getOrderSearchStatus,
})(Orders);
