import React, { Component } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import Loader from '../../layout/Loader';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import Alert from '../../layout/Alert';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import {
  addAlterNote,
  getAlterNotes,
  markDone,
} from '../../../actions/alterNotes';
import { getOrderById } from '../../../actions/rentproduct';
import Spinner from '../../layout/Spinner.js';

class OrderNotes extends Component {
  state = {
    order_id: '',
    note: '',
    alter_request: false,
    alternotes: '',
    loading: true,
  };

  async componentDidMount() {
    await this.props.getOrderById(this.props.match.params.id);
    await this.props.getAlterNotes(this.props.match.params.id);
    const { alternotes, loading } = this.props;
    this.setState({
      alternotes,
      loading,
    });
  }

  onChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleToggle = (e) => {
    this.setState({
      alter_request: !this.state.alter_request,
    });
  };

  onSubmit = async (e) => {
    e.preventDefault();
    let { order_id, note, alter_request } = this.state;
    await this.props.addAlterNote({
      order: this.props.match.params.id,
      order_id: order_id ? order_id : this.props.order.orderNumber,
      note,
      alter_request,
    });

    const { error } = this.props;

    if (error.length == 0) {
      // If error is not there then clear all fields.
      this.setState({
        order_id: '',
        note: '',
        alter_request: false,
      });
    } else {
      // If barcode is wrong then hold back the note and alter request state for better UX.
      this.setState({
        order_id: '',
      });
    }

    await this.props.getAlterNotes(this.props.match.params.id);

    const { alternotes } = this.props;

    this.setState({
      alternotes,
    });
  };

  markAsDoneAlert = (id) => {
    confirmAlert({
      title: 'Hoàn Tất Yêu Cầu',
      message: `Bạn có chắn chắn muốn đánh dấu yêu cầu này đã hoàn tất?`,
      buttons: [
        {
          label: 'Yêu cầu hoàn tất',
          onClick: async () => {
            await this.props.markDone(id);

            var foundIndex = this.state.alternotes.findIndex(
              (x) => x._id == id
            );
            this.state.alternotes[foundIndex].done = true;

            this.setState({
              alternotes: this.state.alternotes,
            });
          },
        },
        {
          label: 'Không, hủy',
          onClick: () => {},
        },
      ],
    });
  };

  alterNotesTable = () => {
    let alterNotesArr = [];

    let { alternotes } = this.state;

    if (alternotes) {
      alternotes.forEach((note) => {
        let prodString = ``;

        if (note.products) {
          note.products.forEach((product) => {
            prodString += `${product.name} | ${product.colorname} | ${product.size}`;
            prodString += '\n';
          });
        }

        alterNotesArr.push({
          order_id: note.order_id,
          products: note.order_id.length <= 7 ? 'Order Note' : prodString,
          note: note.note,
          type: note.alter_request ? (
            <span className='badge badge-warning'>Yêu Cầu</span>
          ) : (
            <span className='badge badge-info'>Ghi Chú</span>
          ),

          status: !note.alter_request ? (
            ''
          ) : note.done ? (
            <span className='badge badge-success'>Hoàn Tất</span>
          ) : (
            <Link
              onClick={() => {
                this.markAsDoneAlert(note._id);
              }}
            >
              Chưa Xong
            </Link>
          ),
          note_by: `${note.emp_name}.`,
        });
      });
    }

    const columns = [
      {
        dataField: 'order_id',
        text: 'Mã Đơn Hàng',
        sort: true,
      },
      {
        dataField: 'products',
        text: 'Sản Phẩm',
        sort: true,
        headerStyle: (colum, colIndex) => {
          return { width: '140px', textAlign: 'left' };
        },
      },
      {
        dataField: 'note',
        text: 'Nội Dung',
        sort: true,
      },
      {
        dataField: 'type',
        text: 'Loại',
        sort: true,
      },
      {
        dataField: 'status',
        text: 'Trạng Thái',
        sort: true,
      },
      {
        dataField: 'note_by',
        text: 'Tạo Bởi',
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
        data={alterNotesArr ? alterNotesArr : []}
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
  };

  render() {
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
                        <h4 className='form-section'>
                          <i className='icon-bag' /> Ghi Chú / Yêu Cầu
                        </h4>
                      </div>
                      <div className='card-body'>
                        <div className='row'>
                          {' '}
                          <Alert />
                        </div>
                        <form
                          className='form form-horizontal form-bordered'
                          // method='POST'
                          onSubmit={(e) => this.onSubmit(e)}
                        >
                          <h4 className='form-section '>
                            <i className='ft-info'></i> Thêm Ghi Chú / Yêu Cầu
                          </h4>
                          <div className='row'>
                            <div className='col-md-3'>
                              <div className=''>
                                <div className=''>
                                  <input
                                    type='text'
                                    id='projectinput3'
                                    className='form-control border-primary'
                                    placeholder='Mã Sản Phẩm (nếu cần)'
                                    name='order_id'
                                    value={this.state.order_id}
                                    onChange={(e) => {
                                      this.onChangeHandler(e);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className='col-md-5'>
                              <div className=''>
                                <div className=''>
                                  <input
                                    type='text'
                                    id='projectinput3'
                                    className='form-control border-primary'
                                    placeholder='Nội Dung Ghi Chú / Yêu Cầu'
                                    name='note'
                                    value={this.state.note}
                                    onChange={(e) => {
                                      this.onChangeHandler(e);
                                    }}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className='col-md-2'>
                              <div className=''>
                                <div className=''>
                                  <label className='radio-inline'>
                                    <input
                                      className='input mr-2'
                                      type='checkbox'
                                      name='alter_request'
                                      onChange={(e) => this.handleToggle()}
                                      checked={this.state.alter_request}
                                    />{' '}
                                    Yêu Cầu?
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className='col-md-2'>
                              <div className=''>
                                <div className=''>
                                  <button
                                    type={'submit'}
                                    className='btn btn-success'
                                  >
                                    <i className='fa fa-plus'></i> Thêm{' '}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className='card-body'>
                        <form
                          className='form form-horizontal form-bordered'
                          method='POST'
                          // onSubmit={(e) => this.onSubmit(e)}
                        >
                          <h4 className='form-section '>
                            <i className='ft-info'></i> Xem Ghi Chú / Yêu Cầu
                          </h4>
                          <div className='row'>
                            <div className='col-md-12'>
                              {this.state.loading ? (
                                // <div>loading....</div>
                                <Spinner />
                              ) : (
                                this.alterNotesTable()
                              )}
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </section>
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

OrderNotes.propTypes = {
  getAlterNotes: PropTypes.func.isRequired,
  addAlterNote: PropTypes.func.isRequired,
  markDone: PropTypes.func.isRequired,
  getOrderById: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  alternotes: state.alternotes.alternotes,
  loading: state.alternotes.loading,
  order: state.rentproduct.rentproduct,
  error: state.alternotes.error,
});
export default connect(mapStateToProps, {
  addAlterNote,
  getAlterNotes,
  markDone,
  getOrderById,
})(OrderNotes);
