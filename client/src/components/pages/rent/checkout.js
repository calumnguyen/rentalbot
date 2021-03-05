import React, { Component } from "react";
import Sidebar from "../../layout/Sidebar";
import Header from "../../layout/Header";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import shortid from "shortid";
import Loader from "../../layout/Loader";
import { getCustomer } from "../../../actions/customer";
import { getAllProductsAll } from "../../../actions/product";
import { OCAlertsProvider } from "@opuscapita/react-alerts";
import { OCAlert } from "@opuscapita/react-alerts";
import Axios from "axios";
import moment from "moment";
import DF from "date-diff";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import BootstrapTable from "react-bootstrap-table-next";
import MPagination from "../../../components/pagination/MPagination";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";

class Checkout extends Component {
  state = {
    barcode: [],
    customer_id: "",
    data: "",
    isModal: false,
    isLoading: false,
    errormsg: "",
    bc: "",
    getOrder: "",
    myRentDate: "",
    page: 1,
    allRoomsCheck: new Map(),
  };

  async componentDidMount() {
    await this.props.getAllProductsAll();

    const { state } = this.props.location;

    if (state) {
      this.setState({
        customer_id: state.customer,
        data: state.data,
        myRentDate: moment(state.data.rentDate).format("DD-MM-YYYY"),
        barcode: state.barcode ? state.barcode : [],
      });
      if(state.barcode && state.barcode.length>0){
        let products = this.props.products;
        let sortedProducts = this.getSortedData(products);
        let newmp = new Map();
        sortedProducts.forEach((product, p_idx) => {
          let mp = new Map([[product.prodUniqueId, false]]);
          newmp = new Map([...newmp, ...mp]);
        });
        state.barcode.forEach((barcodeObj,bar_idx)=> {
          newmp.set(barcodeObj.barcode, true);
          if(bar_idx+1===state.barcode.length){
            this.setState({ allRoomsCheck: newmp });
          }
        })
      }
    }
    if (this.state.customer_id) {
      await this.props.getCustomer(this.state.customer_id);
    }
  }
  clearChecks = () => {
    let newmp = new Map();
    let products = this.props.products;
    let sortedProducts = this.getSortedData(products);
    if (sortedProducts && sortedProducts.length > 0) {
      sortedProducts.map((product, p_idx) => {
        let mp = new Map([[product.prodUniqueId, false]]);
        newmp = new Map([...newmp, ...mp]);
      });
      this.setState({ allRoomsCheck: newmp });
    }
  };
  onChangePage = (page) => {
    this.setState({ page: page });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      //await this.props.getAllProducts(this.state.page);
      this.getAllProductsAll();
    }
  }
  handleSelectedRooms = (e) => {
    let roomIdx = e.target.name;
    let newmp = new Map([...this.state.allRoomsCheck]);
    if (e.target.checked) {
      newmp.set(roomIdx, true);
    } else {
      newmp.set(roomIdx, false);
    }
    this.onScanBarcode(e,roomIdx);
    this.setState({ allRoomsCheck: newmp });
  };
  getTable = () => {
    let products = this.props.products;
    if (products && products.length > 0) {
      var m_prod = [];

      var sortedProducts = this.getSortedData(products);
      sortedProducts.forEach((product, p_index) => {
        if(product.isRented===false && product.isLost===false){
          m_prod.push({
            is_selected: (
              <>
                <input
                  type="checkbox"
                  name={product.prodUniqueId}
                  onChange={this.handleSelectedRooms}
                  checked={this.state.allRoomsCheck.get(product.prodUniqueId)}
                ></input>
              </>
            ),
            prodID: product.smallProdId, //prodId = locationId
            product: product.title,
            roomNo: product.barcode, //barcodeId = roomNo
            onRent: product.isRented,
            isLost: product.isLost,
            price: product.price,
            prodUniqueId: product.prodUniqueId,
          });
        }
      });
    }
    if (sortedProducts) {
      const columns = [
        {
          dataField: "is_selected",
          text: "Select",
          sort: false,
        },
        {
          dataField: "prodID",
          text: "Location ID",
          sort: true,
        },
        {
          dataField: "product",
          text: "Location Name",
          sort: true,
        },
        {
          dataField: "roomNo",
          text: "Room No",
          sort: true,
        },
        {
          dataField: "price",
          text: "Room Rent ($)",
          sort: true,
        },
      ];
      const defaultSorted = [
        {
          dataField: "prodUniqueId",
          order: "asc",
        },
      ];
      const pagination = paginationFactory({
        page: 1,
        sizePerPage: 10,
        lastPageText: ">>",
        firstPageText: "<<",
        nextPageText: ">",
        prePageText: "<",
        showTotal: true,
        alwaysShowAllBtns: true,
        onPageChange: function (page, sizePerPage) {
          //console.log('page', page);
          //console.log('sizePerPage', sizePerPage);
        },
        onSizePerPageChange: function (page, sizePerPage) {
          //console.log('page', page);
          //console.log('sizePerPage', sizePerPage);
        },
        sizePerPageList: [
          {
            text: "5",
            value: 5,
          },
          {
            text: "10",
            value: 10,
          },
          {
            text: "20",
            value: 20,
          },
        ],
      });
      return (
        <>
          <ToolkitProvider
            // bootstrap4
            keyField="prodUniqueId"
            data={m_prod.length === 0 ? [] : m_prod}
            columns={columns}
            defaultSorted={defaultSorted}
            //search
          >
            {(props) => (
              <div>
                <BootstrapTable
                  // bootstrap4
                  keyField="id"
                  data={m_prod}
                  columns={columns}
                  defaultSortDirection="asc"
                  headerClasses="hoveredheader"
                  wrapperClasses="table-responsive"
                  pagination={pagination}
                  {...props.baseProps}
                />
                <br />
              </div>
            )}
          </ToolkitProvider>
        </>
      );
    }
  };
  addBarcodeRow = () => {
    let { barcode } = this.state; // get all barcode
    barcode.push({
      id: shortid.generate(),
      barcode: "",
    });
    this.setState({ barcode });
  };

  onChangeOpenModal = () => {
    if (this.state.isModal) {
      this.setState({ isModal: !this.state.isModal });
    }
  };

  // return sorted products for barcodes
  getSortedData = (products) => {
    // looping through prducts
    let rows = [];
    products.forEach((product, p_index) => {
      let product_name = product.name;
      let product_id = product._id;
      let smallProdId = product.productId;
      // looping through each color of current product
      if (product.color) {
        product.color.forEach((color, c_index) => {
          let color_name = color.colorname;
          let color_id = color._id;
          // looping through sizes of current color
          if (color.sizes) {
            color.sizes.forEach((size, s_index) => {
              let adults = size.adults ? size.adults : 0;
              let children = size.children ? size.children : 0;
              let size_id = size.id;
              let price = size.price;
              let length;
              // show sizes with barcode
              if (size.barcodes) {
                length = size.barcodes.length;
              } else {
                length = 0;
              }

              let i;
              for (i = 0; i < length; i++) {
                let row = {
                  product_id: product_id,
                  smallProdId: smallProdId,
                  prodUniqueId:
                    smallProdId + "-" + color_id + "-" + size_id + "-" + i,
                  color_id: color_id,
                  size_id: size_id,
                  barcodeIndex: i, // will be used to identify index of barcode when changeBarcode is called
                  title:
                    product_name +
                    " | " +
                    color_name +
                    " | " +
                    adults +
                    " adults | " +
                    children +
                    " children",
                  barcode: size.barcodes[i].barcode,
                  isRented: size.barcodes[i].isRented,
                  isLost: size.barcodes[i].isLost,
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

  onScanBarcode = async (e, prodUniqueId) => {
    // e.preventDefault();
    let isChecked = e.target.checked;
    const { products } = this.props;
    if (products) {
      //sorted array is list of all segreggated products by roomno
      const { barcode } = this.state;
      if(isChecked===true){
        barcode.push({
          id: shortid.generate(),
          barcode: prodUniqueId
        });
        this.setState({barcode})
      } else{
        let barcodes = [...this.state.barcode];
        barcodes = barcodes.filter((location)=>location.barcode!==prodUniqueId);
        this.setState({barcode: barcodes});
      }
    }
  };
  removeBarcodeRow = (id) => {
    let { barcode } = this.state;
    barcode = barcode.filter((barcode) => barcode.id !== id); // get current barode
    this.setState({ barcode });
  };
  onProceed = () => {
    const { bc, barcode } = this.state;
    barcode.push({
      id: shortid.generate(),
      barcode: bc.trim(),
    });
    this.setState({ barcode, isModal: false });
  };

  compareDateOfOrder = (returnDate, bc) => {
    let { data } = this.state;
    let date1 = new Date(data.rentDate);
    let date2 = new Date(returnDate);
    let diff = new DF(date1, date2);
    const finalDays = Math.ceil(diff.days());
    if (finalDays > 0 && finalDays <= 5) {
      this.setState({ errormsg: "Hơi Gần Ngày", isModal: true, bc });
      return false;
    }
    if (finalDays == 0) {
      this.setState({ errormsg: "Nguy Hiểm", isModal: true, bc });
      return false;
    }
    if (finalDays <= -1) {
      this.setState({ errormsg: "RẤT NGUY HIỂM", isModal: true, bc });
      return false;
    }
    return true;
  };

  handleChange = (e, barcode_id = "") => {
    let name = e.target.name;
    let value = e.target.value;
    let { barcode } = this.state;

    let barcode_obj = barcode.filter((barcode) => barcode.id === barcode_id)[0];
    const barcodeIndex = barcode.findIndex(
      (barcode) => barcode.id === barcode_id
    );
    barcode_obj[name] = value;
    barcode[barcodeIndex] = barcode_obj;

    this.setState({ barcode });
  };

  getBarcodeRow = () => {
    let { barcode } = this.state; // get all barcode
    if (barcode) {
      return barcode.map((barcode) => (
        <div id="sizes_box" key={barcode.id || barcode._id}>
          <div className="row">
            <div className="left">
              <input
                type="text"
                className="form-control mm-input s-input"
                placeholder="Barcode"
                name="barcode"
                id="widthBr"
                style={{ width: "-webkit-fill-available", color: "black" }}
                onChange={(e) => this.handleChange(e, barcode.id)}
                value={barcode.title}
              />
            </div>
            {/* <div className="right">
              <button
                type="button"
                onClick={() => this.removeBarcodeRow(barcode.id)}
                className="btn btn-raised btn-sm btn-icon btn-danger mt-1"
              >
                <i className="fa fa-minus"></i>
              </button>
            </div> */}
          </div>
        </div>
      ));
    }
  };

  render() {
    const { auth } = this.props;
    if (!auth.loading && !auth.isAuthenticated) {
      return <Redirect to="/login" />;
    }

    if (this.props.location.state === undefined) {
      return <Redirect to="/rentproduct" />;
    }
    // if (this.props.customer === null) {
    //   return <Redirect to="/rentproduct" />;
    // }
    const { user } = auth;
    if (user && user.systemRole === "Employee") {
      if (user && !user.sections.includes("Rentproduct")) {
        return <Redirect to="/Error" />;
      }
    }

    const { customer } = this.props;
    return (
      <React.Fragment>
        <Loader />
        {this.state.isLoading && <LoadingComp />}
        <div className="wrapper menu-collapsed">
          <Sidebar location={this.props.location}></Sidebar>
          <Header></Header>
          <div className="main-panel">
            <div className="main-content">
              <div className="content-wrapper">
                <section id="form-action-layouts">
                  <div className="form-body">
                    <div className="card">
                      <div className="card-header">
                        <h4 className="card-title">Thuê Đồ</h4>
                      </div>
                      <div className="card-content">
                        <div className="card-body table-responsive">
                          <div id="colors_box">
                            <div className="row">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <h2>
                                    Quét/Nhập Mã Sản Phẩm Để Bỏ Đồ Vào Hóa Đơn
                                  </h2>
                                </div>
                              </div>

                              <div className="col-md-12 my-2">
                                <div className="form-group">
                                  <h3>
                                    <strong>
                                      {customer && customer.name}{" "}
                                    </strong>
                                  </h3>
                                  <h4>{`${"Điện Thoại: "}${
                                    customer && customer.contactnumber
                                  }`}</h4>
                                </div>
                              </div>

                              {/* <div className="col-md-12">
                                <div className="form-group">
                                  <form onSubmit={(e) => this.onScanBarcode(e)}>
                                    <input
                                      className="form-control mm-input col-md-12"
                                      type="text"
                                    />
                                  </form>
                                </div>
                              </div> */}
                              <div className="col-md-12">{this.getTable()}</div>
                              <div className="col-md-12">
                                {/* {this.getBarcodeRow()} */}

                                <div className="row text-center ">
                                  <div className="col-md-12 btn-cont">
                                    <div className="form-group">
                                      {(this.state.barcode && this.state.barcode.length>0) ? (
                                        <Link
                                          to={{
                                            pathname: "/rentorder",
                                            state: {
                                              customer_id:
                                                customer && customer._id,
                                              barcode: this.state.barcode,
                                              data: this.state.data,
                                            },
                                          }}
                                          type="button"
                                          className="btn btn-raised btn-primary round btn-min-width mr-1 mb-1 mt-2"
                                          id="btnSize2"
                                        >
                                          <i className="ft-check"></i>
                                          Thanh Toán Hoá Đơn
                                        </Link>
                                      ) : (
                                        <h4 className="mt-2">
                                          Đơn hàng trống. Quét mã để bắt đầu.
                                        </h4>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            <footer className="footer footer-static footer-light">
              <p className="clearfix text-muted text-sm-center px-2">
                <span>
                  Quyền sở hữu của &nbsp;{" "}
                  <a
                    href="https://www.sutygon.com"
                    id="pixinventLink"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-bold-800 primary darken-2"
                  >
                    SUTYGON-BOT{" "}
                  </a>
                  , All rights reserved.{" "}
                </span>
              </p>
            </footer>
          </div>
        </div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          // classes        className={classes.modal}
          open={this.state.isModal}
          // onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.isModal}>
            <div
              style={{
                width: 500,
                backgroundColor: "#fff",
                border: "2px solid gray",
                padding: "5px",
                color: "#000",
              }}
              // className={classes.paper}
            >
              <h5 id="transition-modal-title" style={{ color: "#000" }}>
                Sản phẩm với mã {this.state.bc} tìm thấy trong một đơn hàng khác
                với khả năng bị trùng ngày thuê.
              </h5>
              <h3 className="text-center">
                Ngày Thuê Của Khách :{" "}
                {this.state.myRentDate ? this.state.myRentDate : ""}
              </h3>
              <table
                className="table table-bordered table-light"
                style={{
                  borderWidth: "1px",
                  borderColor: "#aaaaaa",
                  borderStyle: "solid",
                }}
              >
                <thead>
                  <th className="text-center">Đơn Hàng #</th>
                  <th className="text-center">Ngày Trả</th>
                </thead>
                <tbody>
                  <tr style={{ margin: "3px" }}>
                    <td className="text-center">
                      {this.state.getOrder
                        ? this.state.getOrder.orderNumber
                        : ""}
                    </td>
                    <td className="text-center">
                      {this.state.getOrder
                        ? moment(this.state.getOrder.returnDate).format(
                            "DD-MM-YYYY"
                          )
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
              <h1 id="transition-modal-description" className="text-center">
                {this.state.errormsg}
              </h1>
              <div className="row ">
                <div className="mx-auto">
                  <button
                    onClick={this.onProceed}
                    className="btn btn-danger"
                    type="button"
                  >
                    Thêm Sản Phẩm
                  </button>
                  <button
                    onClick={() =>
                      this.setState({ isModal: false, errormsg: "", bc: "" })
                    }
                    className="btn btn-success ml-3"
                    type="button"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </Fade>
        </Modal>
        <OCAlertsProvider />
      </React.Fragment>
    );
  }
}

Checkout.propTypes = {
  getAllProductsAll: PropTypes.func.isRequired,
  getCustomer: PropTypes.func.isRequired,
  saved: PropTypes.bool,
  auth: PropTypes.object,
  customer: PropTypes.object,
};

const mapStateToProps = (state) => ({
  saved: state.rentproduct.saved,
  auth: state.auth,
  customer: state.customer.customer,
  products: state.product.products,
});
export default connect(mapStateToProps, {
  getCustomer,
  getAllProductsAll,
})(Checkout);

const LoadingComp = () => {
  return (
    <div className="loaderContainer">
      <div className="loader">
        <img
          src="/assets/logo-icon.gif"
          alt="Loader"
          className="loader-img"
          width="100"
        />
        <div className="ball-grid-pulse">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};
