import React, { Component } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import Loader from '../../layout/Loader';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import Alert from '../../layout/Alert';
import PropTypes from 'prop-types';
import {
  getOrderById,
  orderStatusReady,
  orderStatusActive,
  orderStatusCancel,
  getOrderItems,
  deleteRentedProduct,
} from '../../../actions/rentproduct';
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';

class ViewOrder extends Component {
  state = {
    id: '',
    orderNumber: '',
    barcodes: '',
    customer: '',
    customerId: '',
    customernumber: '',
    insuranceAmt: '',
    leaveID: '',
    rentDate: '',
    returnDate: '',
    status: '',
    total: '',
    createdAt: '',
    returnOn: '',
    auth_logs: '',
    orderItems: '',
    loading: false,
  };

  async componentDidMount() {
    await this.props.getOrderById(this.props.match.params.id);

    let { order } = this.props;

    // Get Items of current order.
    await this.props.getOrderItems(order._id);

    let { orderItems } = this.props;

    this.setState({
      id: order._id,
      orderNumber: order.orderNumber && order.orderNumber,
      customernumber: order.customerContactNumber,
      customer: order.customer ? order.customer.name : '',
      customerId: order.customer && order.customer._id,
      barcodes: order.barcodes,
      insuranceAmt: order.insuranceAmt,
      leaveID: order.leaveID,
      rentDate: moment(order.rentDate).format('ddd, MMM Do YYYY, h:mm:ss a'),
      returnDate: moment(order.returnDate).format('ddd, MMM Do YYYY'),
      status: order.status,
      total: order.total,
      createdAt: moment(order.createdAt).format('ddd, MMM Do YYYY'),
      returnOn: order.returnedOn ? order.returnedOn : 'Not Returned',
      auth_logs: order.authorization_logs && order.authorization_logs,
      orderItems: orderItems,
      amount_logs: order.amount_steps && order.amount_steps,
    });
  }

  pastOrderAlert() {
    confirmAlert({
      title: 'Past Order',
      message: `Please give customer ${this.state.total} and the insurance amount of ${this.state.insuranceAmt}`,
      buttons: [
        {
          label: 'OK',
          onClick: () => {},
        },
      ],
    });
  }

  cancelOrderAlert = () => {
    confirmAlert({
      title: 'Hủy Đơn',
      message: `Bạn có chắc chắn muốn hủy đơn hàng # ${this.state.orderNumber}?`,
      buttons: [
        {
          label: 'Chắc chắn',
          onClick: async () => {
            await this.props.orderStatusCancel(this.state.id);
            this.props.history.push('/orders');
          },
        },
        {
          label: 'Không',
          onClick: () => {},
        },
      ],
    });
  };

  async statusToReady(id) {
    // status to ready.
    await this.props.orderStatusReady(id);

    let { order } = this.props;

    this.setState({
      status: order.status,
      auth_logs: order.authorization_logs,
    });
  }

  async statusToPickup(id) {
    // status to pickup
    this.props.history.push(`/orders/prepaid/${id}`, { isPayAmount: false });
    // await this.props.orderStatusActive(id);

    // let { order } = this.props;

    // this.setState({
    //   status: order.status,
    //   auth_logs: order.authorization_logs,
    // });
  }

  authorizationLogsTable() {
    const authLogArr = [];

    const { auth_logs } = this.state;

    if (auth_logs) {
      auth_logs.forEach((log, idx) => {
        authLogArr.push({
          sno: idx + 1,
          date: moment(log.date).format('ddd, MMM Do YYYY'),
          employee_name: log.employee_name,
          status: <span className='badge badge-info'>{log.status}</span>,
          message: log.message,
        });
      });
    }

    const columns = [
      {
        dataField: 'sno',
        text: '#',
        sort: true,
      },
      {
        dataField: 'date',
        text: 'Ngày',
        sort: true,
      },
      {
        dataField: 'employee_name',
        text: 'Tên Nhân Viên',
        sort: true,
      },
      {
        dataField: 'status',
        text: 'Trạng Thái Đơn',
        sort: true,
      },
      {
        dataField: 'message',
        text: 'Ghi Chú',
        sort: true,
      },
    ];

    const defaultSorted = [
      {
        dataField: 'contactnumber',
        order: 'asc',
      },
    ];

    return (
      <ToolkitProvider
        // bootstrap4
        keyField='id'
        data={authLogArr.length > 0 ? authLogArr : []}
        columns={columns}
        defaultSorted={defaultSorted}
        // search
      >
        {(props) => (
          <div>
            <BootstrapTable {...props.baseProps} />
            <br />
          </div>
        )}
      </ToolkitProvider>
    );
  }

  payAmountStepLogs() {
    const amount_logsArray = [];

    const { amount_logs } = this.state;

    if (amount_logs) {
      amount_logs.forEach((log, idx) => {
        amount_logsArray.push({
          sno: idx + 1,
          date: moment(log.date).format('ddd, MMM Do YYYY'),
          status: <span className='badge badge-info'>{log.status}</span>,
          amount: `${log.pay} VND`,
        });
      });
    }

    const columns = [
      {
        dataField: 'sno',
        text: '#',
        sort: true,
      },
      {
        dataField: 'date',
        text: 'Ngày Giao Dịch',
        sort: true,
      },
      {
        dataField: 'status',
        text: 'Ghi Chú',
        sort: true,
      },
      {
        dataField: 'amount',
        text: 'Số Tiền Giao Dịch',
        sort: true,
      },
    ];

    const defaultSorted = [
      {
        dataField: 'contactnumber',
        order: 'asc',
      },
    ];

    return (
      <ToolkitProvider
        // bootstrap4
        keyField='id'
        data={amount_logsArray.length > 0 ? amount_logsArray : []}
        columns={columns}
        defaultSorted={defaultSorted}
        // search
      >
        {(props) => (
          <div>
            <BootstrapTable {...props.baseProps} />
            <br />
          </div>
        )}
      </ToolkitProvider>
    );
  }

  orderItemsTable() {
    const Items = [];

    const { orderItems } = this.state;

    if (orderItems) {
      orderItems.forEach((item) => {
        Items.push({
          productId: item.productId,
          product: `${item.name} | ${item.colorname} | ${item.size}`,
          barcode: <span className='badge badge-dark'>{item.barcode}</span>,
          price: item.price,
        });
      });
    }

    const columns = [
      {
        dataField: 'productId',
        text: 'Mã Mẫu Hàng',
        sort: true,
      },
      {
        dataField: 'product',
        text: 'Tên Sản Phẩm',
        sort: true,
      },
      {
        dataField: 'barcode',
        text: 'Mã Sản Phẩm',
        sort: true,
      },
      {
        dataField: 'price',
        text: 'Giá',
        sort: true,
      },
    ];

    const defaultSorted = [
      {
        dataField: 'productId',
        order: 'asc',
      },
    ];

    return (
      <ToolkitProvider
        // bootstrap4
        keyField='id'
        data={Items.length > 0 ? Items : []}
        columns={columns}
        defaultSorted={defaultSorted}
        // search
      >
        {(props) => (
          <div>
            <BootstrapTable {...props.baseProps} />
            <br />
          </div>
        )}
      </ToolkitProvider>
    );
  }

  render() {
    if (this.props.loading) {
      return <Loader />;
    } else {
      return (
        <React.Fragment>
          <Loader />
          <div className='wrapper menu-collapsed'>
            <Sidebar location={this.props.location}></Sidebar>
            <Header></Header>

            <div className='main-panel'>
              <div className='main-content'>
                <div className='content-wrapper'>
                  <section id='form-action-layouts'>
                    <div className='form-body'>
                      <div className='card'>
                        <div className='card-header'>
                          <div className='row'>
                            <div className='col-md-6'>
                              <h4 className='form-section'>
                                <i className='icon-bag' /> Mã Số Đơn Hàng{' '}
                                <strong># {this.state.orderNumber}</strong>
                              </h4>
                            </div>
                            <div className='col-md-6'>
                              <Link to={`/orders/alternotes/${this.state.id}`}>
                                <button className='btn btn-success float-right'>
                                  <i className='icon-bag'></i> Ghi Chú/Yêu Cầu{' '}
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div>
                          {' '}
                          <Alert />
                        </div>
                        <div className='card-body'>
                          <form
                            className='form form-horizontal form-bordered'
                            method='POST'
                            // onSubmit={(e) => this.onSubmit(e)}
                          >
                            <h4 className='form-section '>
                              <i className='ft-info'></i> General information
                            </h4>
                            <div className='row'>
                              <div className='col-md-6'>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput4'
                                  >
                                    Mã Số
                                  </label>

                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput4'
                                      className='form-control border-primary'
                                      placeholder='Mã Số'
                                      name='ordernumber'
                                      value={this.state.orderNumber}
                                      // onChange={(e) => this.handleChangeNumber(e)}
                                      required
                                      minLength={10}
                                      maxLength={10}
                                    />
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    Họ & Tên
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='email'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Họ và Tên'
                                      name='name'
                                      value={this.state.customer}
                                      // onChange={(e) => this.handleChange(e)}
                                      required
                                    />
                                    <Link
                                      to={`/customer/editcustomer/${this.state.customerId}`}
                                    >
                                      <p
                                        style={{
                                          marginTop: '5px',
                                          marginBottom: '0px',
                                        }}
                                      >
                                        Xem Thông Tin Khách
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    SĐT
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Số Điện Thoại'
                                      name='company'
                                      value={this.state.customernumber}
                                      // onChange={(e) => this.handleChange(e)}
                                    />
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    Tổng
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Tổng'
                                      name='total'
                                      value={this.state.total}
                                      // onChange={(e) => this.handleChange(e)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className='col-md-6'>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    Ngày Mở Đơn
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Ngày Mở Đơn'
                                      name='opendate'
                                      value={this.state.createdAt}
                                      // onChange={(e) => this.handleChange(e)}
                                    />
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput1'
                                  >
                                    Ngày Lấy Đồ
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput1'
                                      rows='4'
                                      className='form-control col-md-12 border-primary'
                                      placeholder='Ngày Lấy Đồ'
                                      name='pickup'
                                      value={this.state.rentDate}
                                      // onChange={(e) => this.handleChange(e)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    Ngày Trả
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Ngày Trả'
                                      name='company_address'
                                      value={this.state.returnDate}
                                      // onChange={(e) => this.handleChange(e)}
                                    />
                                  </div>
                                </div>
                                <div className='form-group row'>
                                  <label
                                    className='col-md-3 label-control'
                                    htmlFor='projectinput3'
                                  >
                                    Trả Hàng Lúc
                                  </label>
                                  <div className='col-md-9'>
                                    <input
                                      type='text'
                                      id='projectinput3'
                                      className='form-control border-primary'
                                      placeholder='Chưa Trả'
                                      name='returnon'
                                      value={this.state.returnOn}
                                      // onChange={(e) => this.handleChange(e)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                      <div className='card card-body'>
                        <form
                          className='form form-horizontal form-bordered'
                          method='POST'
                        >
                          <h4 className='form-section '>
                            <i className='ft-info'></i> Sản Phẩm Trong Đơn Hàng
                          </h4>
                          <div className='row'>
                            <div className='col-md-12'>
                              {this.orderItemsTable()}
                            </div>
                          </div>
                        </form>
                      </div>

                      <div className='card card-body'>
                        <form
                          className='form form-horizontal form-bordered'
                          method='POST'
                          // onSubmit={(e) => this.onSubmit(e)}
                        >
                          <h4 className='form-section '>
                            <i className='ft-info'></i> Lịch Sử Trạng Thái
                          </h4>
                          <div className='row'>
                            <div className='col-md-12'>
                              {this.authorizationLogsTable()}
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className='card card-body'>
                        <form
                          className='form form-horizontal form-bordered'
                          method='POST'
                        >
                          <h4 className='form-section '>
                            <i className='ft-info'></i> Lịch Sử Giao Dịch
                          </h4>
                          <div className='row'>
                            <div className='col-md-12'>
                              {this.payAmountStepLogs()}
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </section>
                  <div>
                    {this.state.status !== 'cancel' ? (
                      <div className='row'>
                        <div className=''>
                          {this.state.status == 'pending' ||
                          this.state.status == 'ready' ? (
                            <button
                              to={{ pathname: `/report` }}
                              type='submit'
                              className='mb-2 mr-2 btn btn-raised btn-primary'
                              onClick={() => this.cancelOrderAlert()}
                            >
                              <i className='ft-check' /> Hủy Đơn
                            </button>
                          ) : (
                            <React.Fragment>
                              <button
                                to={{ pathname: `/report` }}
                                type='submit'
                                className='mb-2 mr-2 btn btn-raised btn-primary'
                                onClick={
                                  this.state.status == 'past'
                                    ? () => this.pastOrderAlert()
                                    : () =>
                                        this.props.history.push(
                                          '/returnproduct'
                                        )
                                }
                              >
                                <i className='ft-check' /> Hoàn Tiền
                              </button>
                              <button
                                to={{ pathname: `/report` }}
                                type='submit'
                                className='mb-2 mr-2 btn btn-raised btn-warning'
                                onClick={
                                  this.state.status == 'past'
                                    ? () => this.pastOrderAlert()
                                    : () =>
                                        this.props.history.push(
                                          `/orders/prepaid/${this.state.id}`,
                                          { isPayAmount: true }
                                        )
                                }
                              >
                                <i className='ft-check' />
                                Trả Tiền
                              </button>
                            </React.Fragment>
                          )}
                        </div>
                        <div className=''>
                          {this.state.status !== 'active' &&
                          this.state.status !== 'past' &&
                          this.state.status !== 'lost' &&
                          this.state.status !== 'alteration' ? (
                            <button
                              to={{ pathname: `/report` }}
                              type='submit'
                              className='mb-2 mr-2 btn btn-raised btn-primary'
                              onClick={
                                this.state.status == 'pending'
                                  ? () => this.statusToReady(this.state.id)
                                  : this.state.status == 'ready'
                                  ? () => this.statusToPickup(this.state.id)
                                  : () => {}
                              }
                            >
                              <i className='ft-check' />{' '}
                              {this.state.status == 'pending'
                                ? 'Sẵn Sàng Giao Đồ'
                                : this.state.status == 'ready'
                                ? 'Khách Lấy Đồ'
                                : ''}
                            </button>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
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
          </div>
        </React.Fragment>
      );
    }
  }
}

ViewOrder.propTypes = {
  auth: PropTypes.object,
  order: PropTypes.array,
  getOrderById: PropTypes.func.isRequired,
  orderStatusReady: PropTypes.func.isRequired,
  getOrderItems: PropTypes.func.isRequired,
  deleteRentedProduct: PropTypes.func.isRequired,
  orderStatusCancel: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  order: state.rentproduct.rentproduct,
  orderItems: state.rentproduct.orderItems,
  loading: state.rentproduct.loading,
});
export default connect(mapStateToProps, {
  getOrderById,
  orderStatusReady,
  orderStatusActive,
  orderStatusCancel,
  getOrderItems,
  deleteRentedProduct,
})(ViewOrder);
