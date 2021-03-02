import React, { Component } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import {
  getAllProducts,
  deleteProduct,
  getProductById,
  findProducts,
  changeStatus,
  getFilteredProducts,
} from '../../../actions/product';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Alert from '../../layout/Alert';
import Loader from '../../layout/Loader';
import MPagination from '../../../components/pagination/MPagination';

class ViewProduct extends Component {
  state = {
    filter: '',
    modal_product: null,
    page: 1,
    prodName: '',
    prodId: '',
    barcodeId: '',
    tags: '',
  };

  async componentDidMount() {
    // await this.props.getAllProducts(this.state.page);
    // const { products } = this.props;
    // if (products) {
    //   this.calculateTotals(products);
    // }
    this.getFilterProducts();
  }

  getFilterProducts = async () => {
    if (
      !this.state.barcodeId &&
      !this.state.prodName &&
      !this.state.prodId &&
      !this.state.tags
    ) {
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
    const { products } = this.props;
    if (products) {
      this.calculateTotals(products);
    }
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
    const { products } = this.props;
    if (products) {
      this.calculateTotals(products);
    }
  };
  encodeURI = (src) => {
    var uri = src.split(' ').join('_');
    return uri;
  };

  handleChange = (e, id = '') => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // return sorted products for barcodes
  getSortedData = (products) => {
    // looping through prducts
    let rows = [];
    products.forEach((product, p_index) => {
      let product_name = product.name;
      let product_id = product._id;
      let product_image = product.image;

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
              let price = size.price;
              let totalQty = size.qty;
              let length;

              // show sizes with barcode
              if (size.barcodes) {
                // if barcodes availble then length should be qty - barcodes length
                length = size.barcodes.length;
              } else {
                length = 0;
              }
              let i;
              for (i = 0; i < length; i++) {
                let row = {
                  product_id: product_id,
                  product_image: product_image,
                  prduct_totalQty: totalQty,
                  color_id: color_id,
                  size_id: size_id,
                  barcodeIndex: i, // will be used to identify index of barcode when changeBarcode is called
                  title: product_name + ' | ' + color_name + ' | ' + size_name,
                  barcode: size.barcodes ? size.barcodes[i].barcode : '',
                  price: price,
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

  setModalProduct = (id) => {
    const { formated_products } = this.state;

    if (formated_products) {
      formated_products.forEach((product, p_index) => {
        if (product._id === id) {
          this.setState({ modal_product: product });
        }
      });
    }
  };
  getViewModal = () => {
    let product = this.state.modal_product;
    if (product) {
      return (
        <div>
          <p>Màu Sắc, Kích Cỡ, và Mã Sản Phẩm</p>
          <div className='tree '>
            <ul>
              {product.color &&
                product.color.map((color, color_i) => (
                  <li key={color_i}>
                    <span>
                      <div
                        className='s1'
                        data-toggle='collapse'
                        aria-expanded='true'
                        aria-controls='Web'
                      >
                        <i className='expanded'>
                          <i className='fa fa-arrow-right'></i>
                        </i>{' '}
                        {color.colorname} : {color.total}
                      </div>
                    </span>
                    <div id='Web' className='collapse show'>
                      <ul>
                        {color.sizes &&
                          color.sizes.map((size, size_i) => (
                            <li key={size_i}>
                              <span>
                                <i className='fa fa-arrow-right'></i>
                                {size.size} : {size.qty}
                              </span>
                              <ul>
                                {size.barcodes &&
                                  size.barcodes.map((barcode, barcode_i) => (
                                    <li key={barcode_i}>
                                      <span>
                                        <i className='fa fa-arrow-right'></i>
                                        MÃ SẢN PHẨM # {barcode.barcode}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      );
    }
  };
  calculateTotals = (products) => {
    // looping through prducts
    let rows = [];
    products.forEach((product, p_index) => {
      // looping through each color of current product
      if (product.color) {
        let product_total = 0;
        product.color.forEach((color, c_index) => {
          let color_size_total = 0;
          // looping through sizes of current color
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              color_size_total += parseInt(size.qty);
              size.is_open = false;
            });
            color.total = color_size_total;
            color.is_open = false;
          }

          product_total += parseInt(color.total);
        });
        product.total = product_total;
      }
      // break tags by comma
      if (product.tags && typeof product.tags === 'string') {
        let tags_arr = product.tags.split(',');
        product.tags = tags_arr;
      }
      rows.push(product);
    }); // products foreach ends here
    this.setState({ formated_products: rows });
  };

  toggleColor = (e, product_i, color_i) => {
    const { formated_products } = this.state;

    formated_products[product_i].color[color_i].is_open = !formated_products[
      product_i
    ].color[color_i].is_open;
    this.setState({ formated_products });
    this.getTAble();
  };

  toggleSize = (e, product_i, color_i, size_i) => {
    const { formated_products } = this.state;

    formated_products[product_i].color[color_i].sizes[
      size_i
    ].is_open = !formated_products[product_i].color[color_i].sizes[size_i]
      .is_open;
    this.setState({ formated_products });
  };
  // Replace all <img /> with <Img />

  getTAble = () => {
    const { formated_products } = this.state;

    if (formated_products) {
      if (formated_products) {
        if (formated_products.length === 0) {
          return (
            <tr>
              <td colSpan={10} className='text-center'>
                Chưa có mẫu hàng nào
              </td>
            </tr>
          );
        }
        return formated_products.map((product, i) => (
          <div className='col-xl-4 col-lg-6 col-md-12' key={i}>
            <div className='card product_card'>
              <div className='card-content'>
                <div
                  className='imeg_container'
                  style={{ backgroundImage: `url(${product.image})` }}
                >
                  <span
                    className={
                      'badge badge-pill badge-' +
                      (product.disabled === 'true' ? 'secondary' : 'success') +
                      ' bdg center'
                    }
                  >
                    {product.disabled === 'false' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className='textbbody'>
                  <h4 className='card-title'>{product.name}</h4>
                  <h6 className='card-subtitle text-muted my-2'>
                    Mẫu Hàng (6 chữ số): {product.productId}
                  </h6>
                  <h6 className='card-subtitle text-muted my-2'>
                    Mẫu hàng này có{' '}
                    <span style={{ color: 'red' }}>{product.total}</span> sản
                    phẩm.
                  </h6>
                  {product.tags &&
                    product.tags.map((tag, tag_i) => (
                      <span
                        className='badge badge-pill badge-light'
                        key={tag_i}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                <div className='card-footer'>
                  <Link
                    to={{
                      pathname: `/product/editproduct/${product._id}`,
                      data: product,
                    }}
                    className='btn btn-default mx-n1 my-n2'
                  >
                    {' '}
                    <i className='icon-pencil'></i> Cập Nhật{' '}
                  </Link>
                  <button
                    // href="javascript:void(0)"
                    onClick={(e) =>
                      this.toggleStatus(product.disabled, product._id)
                    }
                    className='btn btn-default mx-n1 my-n2'
                  >
                    {' '}
                    <i
                      className={
                        'icon-control-' +
                        (product.disabled === 'true' ? 'play' : 'pause')
                      }
                    ></i>{' '}
                    {product.disabled === 'true' ? 'Mở Khoá' : 'Ngừng'}
                  </button>
                  <button
                    // href="javascript:void(0)"
                    className='btn btn-default mx-n1 my-n2'
                    data-toggle='modal'
                    data-target='#viewModal'
                    onClick={(e) => this.setModalProduct(product._id)}
                  >
                    <i className='icon-eye'></i> Sản Phẩm
                  </button>
                </div>
              </div>
            </div>
          </div>
        ));
      }
    }
  };
  async searchTable() {
    const searchVal = this.state.search;
    if (searchVal) {
      await this.props.findProducts(searchVal);
    } else {
      await this.props.getAllProducts(this.state.page);
    }
  }

  async toggleStatus(status, product_id) {
    if (status === 'true') {
      status = 'false';
    } else {
      status = 'true';
    }
    await this.props.changeStatus(status, product_id);
    await this.props.getAllProducts(this.state.page);
    const { products } = this.props;
    if (products) {
      this.calculateTotals(products);
    }
  }

  onChangePage = (page) => {
    this.setState({ page: page });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      //await this.props.getAllProducts(this.state.page);
      this.getFilterProducts();
    }
  }
  render() {
    const { auth } = this.props;
    if (!auth.loading && !auth.isAuthenticated) {
      return <Redirect to='/login' />;
    }
    const { user } = auth;
    if (user && user.systemRole === 'Employee') {
      if (user && !user.sections.includes('Inventory')) {
        return <Redirect to='/Error' />;
      }
    }
    return (
      <React.Fragment>
        <Loader />
        <div className='wrapper menu-collapsed'>
          <Header />
          <Sidebar location={this.props.location} />
          <div className='main-panel'>
            <div className='main-content'>
              <div className='content-wrapper'>
                <section id='extended'>
                  <div className='row'>
                    <div className='col-sm-12'>
                      <div className='card'>
                        <div className='card-header'>
                          <h4 className='card-title'>Hàng Kho</h4>
                        </div>
                        <div className='card-content'>
                          <div className='card-body table-responsive'>
                            <div className='row'>
                              <div className='col-md-4'></div>
                              <div className='col-md-4'>
                                {/* <a
                                  href="/product"
                                  className="btn btn-success"
                                  onClick={() => this.searchTable()}
                                >
                                  <i className="fa fa-search"></i> Search{" "}
                                </a> */}
                              </div>
                              <div className='col-md-4'>
                                <Link
                                  // onClick={((e)=>this.redirectToAdd(e))}
                                  to='/product/add'
                                  className='btn btn-primary pull-right'
                                >
                                  <i className='fa fa-plus'></i> Thêm Mẫu Hàng
                                </Link>
                              </div>
                            </div>
                            <div className='row'>
                              <div className='col-sm-2'>
                                <div className='form-group'>
                                  <input
                                    name='prodName'
                                    type='text'
                                    placeholder='Tên Sản Phẩm'
                                    className='form-control'
                                    value={this.state.prodName}
                                    onChange={this.handleChange}
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
                                    onChange={this.handleChange}
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
                                    onChange={this.handleChange}
                                  />
                                </div>
                              </div>
                              <div className='col-sm-2'>
                                <div className='form-group'>
                                  <input
                                    name='tags'
                                    type='text'
                                    placeholder='tags'
                                    className='form-control'
                                    value={this.state.tags}
                                    onChange={this.handleChange}
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
                                    <i className='fa fa-refresh'></i> Xóa Tiêu
                                    Chí
                                  </button>
                                </div>
                              </div>
                            </div>
                            <Alert />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <MPagination
                    onChangePage={this.onChangePage}
                    currentPage={this.state.page}
                    products_total={this.props.products_total}
                  />
                  <div className='row'>{this.getTAble()}</div>
                </section>
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>

          <div
            className='modal fade'
            id='viewModal'
            tabIndex='-1'
            role='dialog'
            aria-labelledby='viewModalLabel'
            aria-hidden='true'
          >
            <div className='modal-dialog' role='document'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title' id='viewModalLabel'>
                    Thông Tin Mẫu Hàng
                  </h5>
                  <button
                    type='button'
                    className='close'
                    data-dismiss='modal'
                    aria-label='Close'
                  >
                    <span aria-hidden='true'>&times;</span>
                  </button>
                </div>
                <div className='modal-body'>
                  {this.getViewModal()}
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>

          {/*<footer className="footer footer-static footer-light">
            <p className="clearfix text-muted text-sm-center px-2"><span>Quyền sở hữu của &nbsp;{" "}
              <a href="https://www.sutygon.com" rel="noopener noreferrer" id="pixinventLink" target="_blank" className="text-bold-800 primary darken-2">SUTYGON-BOT </a>, All rights reserved. </span></p>
          </footer>*/}
        </div>
      </React.Fragment>
    );
  }
}

ViewProduct.propTypes = {
  auth: PropTypes.object,
  getAllProducts: PropTypes.func.isRequired,
  getProductById: PropTypes.func.isRequired,
  deleteProduct: PropTypes.func.isRequired,
  findProducts: PropTypes.func.isRequired,
  changeStatus: PropTypes.func.isRequired,
  products: PropTypes.array,
  product: PropTypes.array,
};

const mapStateToProps = (state) => ({
  products: state.product.products,
  product: state.product.product,
  auth: state.auth,
  products_total: state.product.products_total,
});
export default connect(mapStateToProps, {
  getAllProducts,
  changeStatus,
  deleteProduct,
  getProductById,
  findProducts,
  getFilteredProducts,
})(ViewProduct);
