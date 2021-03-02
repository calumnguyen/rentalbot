import React, { Component } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import {
  getAllProducts,
  updateProduct,
  getProductById,
  barcodeUpdateProduct,
  deleteItem,
  deleteProduct,
  getFilteredProducts,
} from '../../actions/product';
import { searchByBarcode } from '../../actions/rentproduct';
import Loader from '../layout/Loader';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OCAlertsProvider } from '@opuscapita/react-alerts';
import { OCAlert } from '@opuscapita/react-alerts';
import { confirmAlert } from 'react-confirm-alert';
import BootstrapTable from 'react-bootstrap-table-next';
import '../../custom.css';
import MPagination from '../../components/pagination/MPagination';

var JsBarcode = require('jsbarcode');
var { createCanvas } = require('canvas');

class Barcode extends Component {
  state = {
    dataType: 'without_barcode',
    saving: false,
    page: 1,
    prodName: '',
    prodId: '',
    barcodeId: '',
    tags: '',
  };

  async componentDidMount() {
    //await this.props.getAllProducts();
    this.getFilterProducts();
  }
  getFilterProducts = async () => {
    if (!this.state.barcodeId && !this.state.prodName && !this.state.prodId) {
      await this.props.getAllProducts(this.state.page);
    } else {
      if (this.state.tags.length > 0) {
        let tags = this.state.tags.split(',');
        tags = tags.map((tag) => tag.trim());
        tags = tags.join(', ');
        this.setState({ tags });
      }
      let queryObj = {
        page: this.state.page,
        prodId: !this.state.prodId
          ? this.state.prodId
          : Number(this.state.prodId),
        barcodeId: !this.state.barcodeId
          ? this.state.barcodeId
          : Number(this.state.barcodeId),
        tags: this.state.tags,
        prodName: this.state.prodName,
      };
      await this.props.getFilteredProducts(queryObj);
    }
    // const { products } = this.props;
    // if (products) {
    //   this.calculateTotals(products);
    // }
  };
  clearFilter = async () => {
    let queryObj = {
      page: 1,
      prodId: '',
      barcodeId: '',
      tags: '',
      prodName: '',
    };
    this.setState({ ...queryObj });
    await this.props.getAllProducts(this.state.page);
    // const { products } = this.props;
    // if (products) {
    //   this.calculateTotals(products);
    // }
  };
  onChangePage = (page) => {
    this.setState({ page: page });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      //await this.props.getAllProducts(this.state.page);
      this.getFilterProducts();
    }
  }

  // return sorted products for barcodes / without barcodes
  getSortedData = (products) => {
    // looping through prducts
    let rows = [];
    products.forEach((product, p_index) => {
      let product_name = product.name;
      let product_id = product._id;

      // looping through each color of current product
      if (product.color) {
        product.color.forEach((color, c_index) => {
          let color_name = color.colorname;
          let color_id = color._id;

          // looping through sizes of current color
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              let size_name = size.size;
              let size_id = size.id;

              let length;
              if (this.state.dataType === 'without_barcode') {
                // show sizes without barcodes
                // if we have some barcodes then skip that
                // number of rows for the current size
                if (size.barcodes) {
                  // if barcodes availble then length should be qty - barcodes length
                  length = size.qty - size.barcodes.length;
                } else {
                  length = size.qty;
                }
              } else {
                // show sizes with barcode
                if (size.barcodes) {
                  length = size.barcodes.length;
                } else {
                  length = 0;
                }
              }

              let i;
              for (i = 0; i < length; i++) {
                let row = {
                  product_id: product_id,
                  color_id: color_id,
                  size_id: size_id,
                  short_product_id: product.productId,
                  barcodeIndex: i, // will be used to identify index of barcode when changeBarcode is called
                  title: product_name + ' | ' + color_name + ' | ' + size_name,
                  barcodes: size.barcodes ? size.barcodes : [],
                };
                rows.push(row);
              }
            });
          }
        });
      }
    }); // products foreach ends here
    return rows;
  };

  _handleChange = (e, id = '') => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleChange = (type = '') => {
    this.setState({ dataType: type, page: 1 });
  };
  getTable = () => {
    let products = this.props.products;
    if (products) {
      var m_prod = [];

      var sortedProducts = this.getSortedData(products);
      sortedProducts.forEach((product, p_index) => {
        m_prod.push({
          prodID: product.short_product_id,
          product: product.title,
          barcodeID:
            this.state.dataType === 'with_barcode' ? (
              <Link
                to={{
                  pathname: `/individualbarcode/${
                    product.barcodes[product.barcodeIndex].barcode
                  }`,
                  state: { p_id: product.product_id },
                }}
                data-toggle='tooltip'
                title='Bấm để xem thông tin sản phẩm'
                className='individual_item'
              >
                {product.barcodes[product.barcodeIndex].barcode}
              </Link>
            ) : (
              ''
            ),
          changeBarcode:
            this.state.dataType === 'without_barcode' ? (
              <button
                type='button'
                className='btn btn-raised btn-primary round btn-min-width mr-1 mb-1'
                onClick={(e) =>
                  this.genPrintRandBarcode(
                    e,
                    product.product_id,
                    product.color_id,
                    product.size_id
                  )
                }
              >
                Tạo một mã đồ ngẫu nhiên
              </button>
            ) : (
              <button
                type='button'
                className='btn btn-raised btn-primary round btn-min-width mr-1 mb-1'
                onClick={(e) =>
                  this.changeBarcode(
                    e,
                    product.product_id,
                    product.color_id,
                    product.size_id,
                    product.barcodeIndex
                  )
                }
              >
                Đổi Mã
              </button>
            ),
          scanBarcode:
            this.state.dataType === 'without_barcode' ? (
              <form
                onSubmit={(e) =>
                  this.OnSubmitScanBarcode(
                    e,
                    product.product_id,
                    product.color_id,
                    product.size_id
                  )
                }
              >
                <input
                  type='text'
                  className='form-control mm-input'
                  placeholder={'Nhập mã 8 chữ số'}
                  maxLength={8}
                  minLength={8}
                />
              </form>
            ) : (
              <button
                type='button'
                className='btn btn-raised btn-primary round btn-min-width mr-1 mb-1'
                onClick={(e) =>
                  this.printBarcode(
                    product.barcodes[product.barcodeIndex].barcode
                  )
                }
              >
                In Mã
              </button>
            ),
          deleteItem:
            this.state.dataType === 'without_barcode' ? (
              <button
                type='button'
                className='btn btn-raised btn-primary round btn-min-width mr-1 mb-1'
                onClick={(e) =>
                  this.deleteConfirm(
                    e,
                    product.product_id,
                    product.color_id,
                    product.size_id
                  )
                }
              >
                Xoá Đồ
              </button>
            ) : (
              <button
                type='button'
                className='btn btn-raised btn-primary round btn-min-width mr-1 mb-1'
                onClick={(e) =>
                  this.deleteConfirm(
                    e,
                    product.product_id,
                    product.color_id,
                    product.size_id,
                    product.barcodeIndex,
                    product.barcodes[product.barcodeIndex].barcode
                  )
                }
              >
                Xoá Đồ
              </button>
            ),
        });
      });
    }
    if (sortedProducts) {
      const columns = [
        {
          dataField: 'prodID',
          text: 'ID',
          sort: true,
        },
        {
          dataField: 'product',
          text: 'Tên Sản Phẩm',
          sort: true,
        },
        this.state.dataType === 'with_barcode'
          ? {
              dataField: 'barcodeID',
              text: 'Mã Đồ',
              sort: true,
            }
          : '',
        {
          dataField: 'changeBarcode',
          text:
            this.state.dataType === 'with_barcode' ? 'Change Barcode' : 'In Mã',
          sort: true,
        },
        {
          dataField: 'scanBarcode',
          text: 'Nhập Mã',
          sort: true,
        },
        {
          dataField: 'deleteItem',
          text: 'Xoá Đồ',
          sort: true,
        },
      ];

      return (
        <>
          {m_prod && m_prod.length === 0 ? (
            <BootstrapTable
              keyField='id'
              data={[]}
              columns={columns}
              noDataIndication='Không có sản phẩm nào'
            />
          ) : (
            <>
              <MPagination
                onChangePage={this.onChangePage}
                currentPage={this.state.page}
                products_total={this.props.products_total}
              />
              <br />
              <BootstrapTable
                // bootstrap4
                keyField='id'
                data={m_prod}
                columns={columns}
                defaultSortDirection='asc'
                headerClasses='hoveredheader'
              />
            </>
          )}
        </>
      );
    }
  };

  // return sorted products for barcodes
  getBarcodeData = (products) => {
    // looping through prducts
    let barcodes = [];
    products.forEach((product, p_index) => {
      if (product.color) {
        product.color.forEach((color, c_index) => {
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              let length;
              if (size.barcodes) {
                length = size.barcodes.length;
              } else {
                length = 0;
              }
              for (var i = 0; i < length; i++) {
                barcodes.push(size.barcodes[i].barcode);
              }
            });
          }
        });
      }
    }); // products foreach ends here
    return barcodes;
  };

  // runs when existing barcode is scanned
  OnSubmitScanBarcode = async (e, product_id, color_id, size_id) => {
    e.preventDefault();
    const { products } = this.props;
    const barcodesData = this.getBarcodeData(products);
    // get barcode input value
    let barcode = e.target[0].value;
    const isInclude = barcodesData.includes(barcode);
    if (isInclude === true) {
      // error message
      OCAlert.alertError(
        'Mã đồ này đã ở trong hệ thống. Mỗi mã đồ chỉ có thể được sử dụng một lần.',
        {
          timeOut: 5000,
        }
      );
      return;
    }
    // empty barcode input
    else if (isInclude === false) {
      e.target[0].value = '';
      this.saveBarCode(barcode, product_id, color_id, size_id);
      // success message
      OCAlert.alertSuccess('Đã cập nhật mã đồ cho sản phẩm này');
    }
  };

  // generate and print random bar code
  genPrintRandBarcode = async (e, product_id, color_id, size_id) => {
    // generate random barcode
    let barcode = Math.floor(Math.random() * 89999999 + 10000000);
    this.saveBarCode(barcode, product_id, color_id, size_id);
    this.printBarcode(barcode);
    OCAlert.alertSuccess('Đã thiết lập một mã đồ 8 chữ số cho sản phẩm này');
  };

  deleteConfirm = async (
    e,
    product_id,
    color_id,
    size_id,
    barcodeIndex,
    barcode
  ) => {
    await this.props.searchByBarcode(barcode);
    const { barcoderec } = this.props;
    if (barcoderec && barcoderec.length == 0) {
      confirmAlert({
        title: 'Xóa Đồ',
        message: 'Bạn có chắc chắn muốn xóa sản phẩm naỳ không?',
        buttons: [
          {
            label: 'Có, xoá ngay',
            onClick: () => {
              this.deleteItem(e, product_id, color_id, size_id, barcodeIndex);
            },
          },
          {
            label: 'Không, hủy',
            onClick: () => {},
          },
        ],
      });
    } else {
      // error message
      OCAlert.alertError(
        `Mã đồ ${barcode && barcode} đang được sử dụng trong đơn hàng ${
          barcoderec && barcoderec[0].orderNumber
        }, Bạn không thể xoá nó vào lúc này.`,
        {
          timeOut: 3000,
        }
      );
      return;
    }
  };

  // Delete Item
  deleteItem = async (e, product_id, color_id, size_id, barcodeIndex) => {
    // get product by id
    await this.props.getProductById(product_id);
    const { product } = this.props;
    // return;

    let total_qty = 0;
    if (product && product.color) {
      // loop through product colors
      product.color.forEach((color, c_index) => {
        // get right color obj
        if (color._id === color_id) {
          // get right size obj
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              total_qty += parseInt(size.qty);
              if (size.id === size_id) {
                // decrease size qty
                if (size.qty > 0) {
                  size.qty = parseInt(size.qty) - 1;

                  // if barcode is availble remove it too
                  if (typeof barcodeIndex !== 'undefined') {
                    size.barcodes.splice(barcodeIndex, 1);
                  }
                }
              }
            });
          }
        }
      });
      // update product for barcode only
      await this.props.deleteItem(product, product_id);
    }
    this._deleteProduct(product);

    OCAlert.alertSuccess('Đã xóa sản phẩm thành công');
  };

  _deleteProduct = async (product) => {
    // const { product } = this.props;
    let total_qty = 0;
    const ex_product = product;
    if (ex_product && ex_product.color) {
      // loop through product colors

      ex_product.color.forEach((color, c_index) => {
        if (color.sizes) {
          color.sizes.forEach((size, s_index) => {
            total_qty += parseInt(size.qty);
          });
        }
      });

      if (total_qty === 0) {
        await this.props.deleteProduct(product._id);
        OCAlert.alertSuccess('Đã xoá mặt hàng khỏi kho hàng');
      }
      return;
    }
  };

  // change existing barcode in size object and correct index
  changeBarcode = async (e, product_id, color_id, size_id, barcodeIndex) => {
    confirmAlert({
      title: 'Đổi Mã',
      message:
        'Đổi mã sẽ xóa mã đồ hiện tại và chuyển sản phẩm này sang nhóm sản phẩm chưa có mã đồ. Ok?',
      buttons: [
        {
          label: 'Ok, đổi mã',
          onClick: () => {
            this.saveBarCode(
              null,
              product_id,
              color_id,
              size_id,
              'update',
              barcodeIndex
            );
            OCAlert.alertSuccess(
              'Mã đồ đã được xóa. Sản phẩn bây giờ đang nằm với các sản phẩm chưa có mã.'
            );
          },
        },
        {
          label: 'Không, hủy',
          onClick: () => {},
        },
      ],
    });
  };

  printBarcode = (barcode) => {
    var canvas = createCanvas();

    // convert barcode to image and open in new window and print
    JsBarcode(canvas, barcode);
    let html = '<img src="' + canvas.toDataURL() + '" style="width: 100%" />';
    let newWindow = window.open(
      '',
      '_blank',
      'location=yes,height=570,width=720,scrollbars=yes,status=yes'
    );
    newWindow.document.write(html);
    newWindow.window.print();
    newWindow.document.close();
  };

  // saves the barcode in specific item > color > size object
  saveBarCode = async (
    barcode,
    product_id,
    color_id,
    size_id,
    mode = 'add',
    barcodeIndex = ''
  ) => {
    // get product by id
    await this.props.getProductById(product_id);
    const { product, auth } = this.props;

    if (product && product.color) {
      // loop through product colors
      product.color.forEach((color, c_index) => {
        // get right color obj
        if (color._id === color_id) {
          // get right size obj
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              if (size.id === size_id) {
                // check if current size obj contain barcodes or not
                if (size.barcodes) {
                  if (mode === 'add') {
                    size.barcodes.push({
                      barcode, // Add barcode
                      authorization_logs: [
                        {
                          employee_id: auth.user._id,
                          employee_name: auth.user.fullname,
                          message: `Sản phẩm được bỏ vào kho.`,
                        },
                      ],
                    }); // Add barcode
                  } else {
                    // size.barcodes[barcodeIndex].barcode = barcode; // Change barcode
                    size.barcodes.splice(barcodeIndex, 1);
                  }
                } else {
                  // create new barcode array
                  size.barcodes = [];
                  // and push this new barcode to it
                  size.barcodes.push({ barcode });
                }
              }
            });
          }
        }
      });

      // update product for barcode only
      await this.props.barcodeUpdateProduct(product, product_id);
      return barcode;
    }
  };

  render() {
    const { auth } = this.props;
    if (!auth.loading && !auth.isAuthenticated) {
      return <Redirect to='/login' />;
    }
    const { user } = auth;
    if (user && user.systemRole === 'Employee') {
      if (user && !user.sections.includes('Barcode')) {
        return <Redirect to='/Error' />;
      }
    }
    // if (this.props.saved) {
    //   return <Redirect to="/barcode" />;
    // }

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
                        <h4 className='form-section'>Barcode</h4>
                      </div>

                      <div className='card-body'>
                        <div className='custom-radio custom-control-inline ml-3'>
                          <input
                            type='radio'
                            id='customRadioInline1'
                            name='dataType'
                            className='custom-control-input'
                            onChange={(e) =>
                              this.handleChange('without_barcode')
                            }
                            checked={this.state.dataType === 'without_barcode'}
                          />
                          <label
                            className='custom-control-label'
                            htmlFor='customRadioInline1'
                          >
                            Sản Phầm Chưa Có Mã
                          </label>
                        </div>

                        <div className='custom-radio custom-control-inline ml-3'>
                          <input
                            type='radio'
                            id='customRadioInline2'
                            name='dataType'
                            className='custom-control-input'
                            onChange={(e) => this.handleChange('with_barcode')}
                            checked={this.state.dataType === 'with_barcode'}
                          />
                          <label
                            className='custom-control-label'
                            htmlFor='customRadioInline2'
                          >
                            Sản Phẩm Với Mã
                          </label>
                        </div>

                        <br />
                        <div className='row mt-2'>
                          <div className='col-sm-2'>
                            <div className='form-group'>
                              <input
                                name='prodName'
                                type='text'
                                placeholder='Tên Sản Phẩm'
                                className='form-control'
                                value={this.state.prodName}
                                onChange={this._handleChange}
                              />
                            </div>
                          </div>
                          <div className='col-sm-2'>
                            <div className='form-group'>
                              <input
                                name='prodId'
                                type='number'
                                placeholder='Mã Mẫu Hàng'
                                className='form-control'
                                value={this.state.prodId}
                                onChange={this._handleChange}
                              />
                            </div>
                          </div>
                          <div className='col-sm-2'>
                            <div className='form-group'>
                              <input
                                name='barcodeId'
                                type='number'
                                placeholder='Mã Sản Phẩm'
                                className='form-control'
                                value={this.state.barcodeId}
                                onChange={this._handleChange}
                              />
                            </div>
                          </div>
                          <div className='col-sm-4'>
                            <div className='form-group'>
                              <button
                                className='btn btn-primary'
                                onClick={this.getFilterProducts}
                              >
                                <i className='fa fa-search'></i> Tìm
                              </button>
                              <button
                                className='btn btn-primary ml-2'
                                onClick={this.clearFilter}
                              >
                                <i className='fa fa-refresh'></i> Xóa Tiêu Chí
                              </button>
                            </div>
                          </div>
                        </div>
                        <br />
                        {/* <BootstrapTable
                          bootstrap4
                          keyField="id"
                          data={prodArr}
                          columns={this.columns}
                          defaultSorted={this.defaultSorted}

                        /> */}
                        {/* <table className="table text-center">

                          <thead>
                            <tr>
                              <th>Product ID</th>
                              <th>Product</th>
                              {(this.state.dataType === "with_barcode") && (
                                <th>Barcode</th>
                              )}
                              <th>Change Barcode</th>
                              <th>Scan Barcode</th>
                              <th>Delete item</th>
                            </tr>
                          </thead>
                          <tbody>*/}
                        {this.getTable()}
                        {/* </tbody>
                          <tbody></tbody>
                        </table>  */}
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
        <OCAlertsProvider />
      </React.Fragment>
    );
  }
}

Barcode.propTypes = {
  saved: PropTypes.bool,
  getAllProducts: PropTypes.func.isRequired,
  updateProduct: PropTypes.func.isRequired,
  barcodeUpdateProduct: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  getProductById: PropTypes.func.isRequired,
  deleteProduct: PropTypes.func.isRequired,
  auth: PropTypes.object,
};

const mapStateToProps = (state) => ({
  products: state.product.products,
  product: state.product.product,
  saved: state.product.saved,
  auth: state.auth,
  products_total: state.product.products_total,
  barcoderec: state.rentproduct.barcoderec,
});
export default connect(mapStateToProps, {
  getAllProducts,
  updateProduct,
  getProductById,
  barcodeUpdateProduct,
  deleteItem,
  deleteProduct,
  searchByBarcode,
  getFilteredProducts,
})(Barcode);
