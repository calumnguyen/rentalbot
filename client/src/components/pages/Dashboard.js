import React, { Component } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import Loader from '../layout/Loader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAllAppointments } from '../../actions/appointment';
import {
  getAllRentedProducts,
  getDashboardCountOrders,
} from '../../actions/rentproduct';
import { getAllProducts } from '../../actions/product';
import { getUser, updateEvents, getremoveEvents } from '../../actions/user';
import { getAllEvents, getAllBirthdayEvents } from '../../actions/events';
import { changeShopStatus, getShop } from '../../actions/dashboard';
import * as moment from 'moment';
import '../../login.css';
import '../../dashbaord.css';
import { Redirect } from 'react-router-dom';

class Dashboard extends Component {
  state = {
    currenWeekEvents: [],
    removedevents: '',
  };
  async componentDidMount() {
    const { auth } = this.props;
    const { user } = auth && auth;
    if (user) {
      this.setState({ id: user._id });
    }
    await this.props.getDashboardCountOrders();
    await this.props.getAllAppointments();
    await this.props.getAllRentedProducts();
    await this.props.getAllProducts();
    await this.props.getShop();
    await this.props.getAllEvents();
    await this.props.getAllBirthdayEvents();

    const { r_events } = this.props;
    this.setState({ removedevents: r_events });
    await this.getEvents();
  }
  async componentDidUpdate(prevProps, prevState) {
    const { auth } = this.props;
    const { user } = auth && auth;
    if (user) {
      await this.props.getremoveEvents(user._id);
    }
    if (prevProps.r_events != this.props.r_events) {
      const { r_events } = this.props;
      await this.getEvents();

      this.setState({ removedevents: r_events });
    }
  }
  async changeShopStatus(status) {
    await this.props.changeShopStatus(status);
    await this.props.getShop();
  }

  calculate_age = (dob1) => {
    var today = new Date();
    var birthDate = new Date(dob1);
    var age_now = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age_now--;
    }
    return age_now;
  };

  getfilteredEvents = (currenWeekEvents) => {
    const { r_events } = this.props;
    const { remove_arr } = r_events && r_events;
    var filteredEvents =
      currenWeekEvents &&
      currenWeekEvents.filter((a) => remove_arr && !remove_arr.includes(a._id));

    return filteredEvents;
  };
  getcurrentdaysEvents = (updatedEvents, currentdate) => {
    var currenDayEvents =
      updatedEvents &&
      updatedEvents.filter((a) => {
        var m_date =
          new Date(a.date).getFullYear() +
          '-' +
          ('0' + (Number(new Date(a.date).getMonth()) + 1)).slice(-2) +
          '-' +
          ('0' + Number(new Date(a.date).getDate())).slice(-2) +
          'T19:00:00.000Z';

        return m_date == currentdate;
      });
    return currenDayEvents;
  };
  getcurrentWeeksEvents = (currentdate, updatedEvents) => {
    var dateAfterSevenDays = moment(moment().add(5, 'days')).format();
    var currenWeekEvents =
      updatedEvents &&
      updatedEvents.filter((a) => {
        var m_date =
          new Date(a.date).getFullYear() +
          '-' +
          ('0' + (Number(new Date(a.date).getMonth()) + 1)).slice(-2) +
          '-' +
          ('0' + Number(new Date(a.date).getDate())).slice(-2) +
          'T19:00:00.000Z';

        return m_date > currentdate && a.date <= dateAfterSevenDays;
      });
    return currenWeekEvents;
  };
  getbdayevent = () => {
    const { b_events } = this.props;
    const m_bevents = [];
    b_events &&
      b_events.forEach((event) => {
        const new_Date =
          new Date(event.date).getFullYear() +
          '-' +
          ('0' + (Number(new Date(event.birthdate).getMonth()) + 1)).slice(-2) +
          '-' +
          ('0' + Number(new Date(event.birthdate).getDate())).slice(-2) +
          'T19:00:00.000Z';
        const age = this.calculate_age(event.birthdate);

        if (
          event.user.accountStatus == 'active'
            ? m_bevents.push({
              date: new_Date,
              timeStart: event.timeStart,
              timeEnd: event.timeEnd,
              name:
                event.name && `${event.name}'s ${age} Birthday Aniversary`,
              note: event.note,
              location: event.location,
              _id: event._id,
            })
            : ''
        );
      });
    return m_bevents;
  };
  getEvents() {
    const { events } = this.props;
    var currentdate =
      new Date().getFullYear() +
      '-' +
      ('0' + (Number(new Date().getMonth()) + 1)).slice(-2) +
      '-' +
      ('0' + Number(new Date().getDate())).slice(-2) +
      'T19:00:00.000Z';
    var m_bevents = this.getbdayevent();
    //updating all events
    let updatedEvents = events && m_bevents && [...m_bevents, ...events];
    const currenWeekEvents = this.getcurrentWeeksEvents(
      currentdate,
      updatedEvents
    );
    const currenDaysEvents = this.getcurrentdaysEvents(
      updatedEvents,
      currentdate
    );
    const filteredEvents = this.getfilteredEvents(currenWeekEvents);

    var events_arr = events &&
      filteredEvents && [...filteredEvents, ...currenDaysEvents];

    this.setState({
      currenWeekEvents: events_arr,
    });
  }

  getPendingOrder = () => {
    // e.preventDefault()
    const { rentedproducts } = this.props;
    if (rentedproducts) {
      let events = rentedproducts.filter(
        (a) => new Date(a.returnDate) - new Date() > 0
      );

      return events.length;
    }
  };
  getOverDueOrder = () => {
    const { rentedproducts } = this.props;
    if (rentedproducts) {
      var currentdate = moment(new Date()).format('MM/DD/YYYY');

      let events = rentedproducts.filter((a) =>
        moment(moment(a.returnDate).format('MM/DD/YYYY')).isBefore(currentdate)
      );

      if (events.length > 0) {
        let returningOrders = events.filter((f) => f.readyForPickUp == true);
        return returningOrders.length;
      } else {
        return 0;
      }
    }
  };

  getTodaysOrder = () => {
    // e.preventDefault()
    const { rentedproducts } = this.props;
    if (rentedproducts) {
      var currentdate = moment(new Date()).format('MM/DD/YYYY');

      let events = rentedproducts.filter((a) =>
        moment(moment(a.createdAt).format('MM/DD/YYYY')).isSame(currentdate)
      );
      return events.length;
    }
  };
  orderPickUpToday = () => {
    const { rentedproducts } = this.props;
    if (rentedproducts) {
      var currentdate = moment(new Date()).format('MM/DD/YYYY');
      let events = rentedproducts.filter((a) =>
        moment(moment(a.rentDate).format('MM/DD/YYYY')).isSame(currentdate)
      );
      let returningOrders = events.filter((f) => f.status !== 'Completed');
      return returningOrders.length;
    }
  };
  getReturnOrder = () => {
    // e.preventDefault()
    const { rentedproducts } = this.props;
    if (rentedproducts) {
      var currentdate = moment(new Date()).format('MM/DD/YYYY');
      let events = rentedproducts.filter((a) =>
        moment(moment(a.returnDate).format('MM/DD/YYYY')).isSame(currentdate)
      );
      return events.length;
    }
  };

  hideAlert = async (e, id, eventID) => {
    e.preventDefault();
    await this.props.updateEvents(id, eventID);
  };
  getTodaysAppointment = () => {
    // e.preventDefault()
    const { appointment } = this.props;
    if (appointment) {
      var currentdate =
        moment(new Date()).format('YYYY-MM-DD') + 'T19:00:00.000Z';
      let events = appointment.filter((a) => {
        let ap_date =
          moment(new Date(a.date)).format('YYYY-MM-DD') + 'T19:00:00.000Z';
        return ap_date == currentdate;
      });

      return events.length;
    }
  };

  render() {
    const { shop } = this.props;
    const { user } = this.props.auth;
    if (user && user.systemRole === 'Employee') {
      if (shop) {
        let openShop = shop[0];
        if (openShop && openShop.status === 'off') {
          return (
            <Redirect
              push
              to={{
                pathname: '/storeclosed',
                shop: shop[0],
              }}
            />
          );
        }
      }
    }
    const startTime =
      this.props.shop[0] && moment(this.props.shop[0].shopStartTime);
    const {
      today_order,
      return_today,
      pickup_today,
      overdue_today,
      alterations
    } = this.props.count_orders;
    return (
      <React.Fragment>
        <Loader />
        <div className='wrapper menu-collapsed'>
          <Sidebar location={this.props.location}></Sidebar>
          <Header></Header>

          <div className='main-panel'>
            <div className='main-content'>
              <div className='content-wrapper'>
                <div className='row'>
                  <h4 className='ml-4 mb-4 text-bold-400 greeting_text'>
                    Xin chào {user && user.fullname && `${user.fullname}`}, chúc
                    bạn một ngày thật vui vẻ!
                  </h4>
                </div>
                <div className='row'>
                  <div className='col-md-7'>
                    <div className='container px-6 mx-auto'>
                      <div className='grid gap-6 mb-8 md:grid-cols-4 grid-cols-4 xl:grid-cols-4 '>
                        {/* card1 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='text-orange-500 gradient-blueberry rounded-full card-dashboard-span'>
                            <div className='text'>
                              {pickup_today ? pickup_today : 0}
                            </div>
                          </div>
                          <div className='text-card'>
                            <span>Lấy Hàng Hôm Nay</span>
                          </div>
                        </div>
                        {/* card2 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='text-orange-500 gradient-red-pink rounded-full card-dashboard-span'>
                            <div className='text'>
                              {return_today ? return_today : 0}
                            </div>
                          </div>
                          <div className='text-card'>
                            <span className="ml-2"> Trả Đồ Hôm Nay</span>
                          </div>
                        </div>
                        {/* card3 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='gradient-light-blue-indigo rounded-full card-dashboard-span'>
                            <div className='text'>
                              {this.getTodaysAppointment()}
                            </div>
                          </div>
                          <div className='text-card'>
                            <span> Hẹn Thử Đồ Hôm Nay</span> <br />{' '}
                          </div>
                        </div>
                        {/* card4 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='text-orange-500 gradient-crystal-clear rounded-full card-dashboard-span'>
                            <div className='text'>{alterations?alterations:0}</div>
                          </div>
                          <div className='text-card-repair'>
                            <span> Đơn Hàng Cần Sửa Đồ</span> {' '}
                          </div>
                        </div>{' '}
                        {/* card5 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='text-orange-500 gradient-orange rounded-full card-dashboard-span'>
                            <div className='text'>
                              {' '}
                              {overdue_today ? overdue_today : 0}
                            </div>
                          </div>
                          <div className='text-card'>
                            <span> Đơn Hàng Quá Hạn</span>
                          </div>
                        </div>{' '}
                        {/* card6 */}
                        <div className='flex items-center bg-white shadow-xs card-dashboard'>
                          <div className='text-orange-500 gradient-love-couple rounded-full card-dashboard-span'>
                            {' '}
                            <div className='text'>
                              {today_order ? today_order : 0}
                            </div>{' '}
                          </div>
                          <div className='text-card-repair'>
                            <span> Đơn Hàng Mới Hôm Nay</span> <br />{' '}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='col-md-5 alert_box col-sm-3'>
                    <div className='card card-alert gradient-light-blue-indigo'>
                      {this.state.currenWeekEvents &&
                        this.state.currenWeekEvents.length > 0 &&
                        this.state.currenWeekEvents
                          .slice(0)
                          .reverse()
                          .map((a, a_i) => {
                            return (
                              <div className='alert alert-secondary alert-dismissible m-1'>
                                <button
                                  type='button'
                                  className='close'
                                  data-dismiss='alert'
                                  onClick={(e) =>
                                    this.hideAlert(e, user && user._id, a._id)
                                  }
                                  aria-label='Close'
                                >
                                  <span aria-hidden='true'>&times;</span>
                                </button>
                                <p className='my-n1'>
                                  <strong>{a.name}</strong>
                                </p>
                                <p className='my-n1'>
                                  <small className='text-muted'>
                                    Date :{moment(a.date).format('DD-MM-YYYY')}{' '}
                                  </small>
                                </p>
                                <p className='my-n1'>
                                  <small className='text-muted'>
                                    From :
                                    {moment(a.timeStart).format('hh:mm A')}, To
                                    : {moment(a.timeEnd).format('hh:mm A')}
                                  </small>
                                </p>
                                {a.location ? (
                                  <p className='my-n1'>
                                    <small className='text-muted'>
                                      Location:{a.location}
                                    </small>
                                  </p>
                                ) : (
                                    ''
                                  )}

                                {a.note ? (
                                  <p className='my-n1'>
                                    <small className='text-muted'>
                                      Note:{a.note}
                                    </small>
                                  </p>
                                ) : (
                                    ''
                                  )}
                              </div>
                            );
                          })}
                    </div>
                  </div>
                </div>

                {user && user.systemRole === 'Admin' ? (
                  <>
                    {' '}
                    <div className='row mt-5 custom_row' >
                      <div className='container-fluid px-6 mx-auto grid'>
                        <div className='grid gap-6 mb-8 md:grid-cols-4 xl:grid-cols-ab'>
                          {/* card1 */}
                          <div className='flex items-center bg-white shadow-xs card-store shop_button'>
                            <div className='gradient-light-blue-indigo rounded-full card-dashboard-store'>
                              {this.props.shop[0] &&
                                (this.props.shop[0].status === 'on' ? (
                                  <i className='fa fa-unlock-alt'></i>
                                ) : (
                                    <i className='fa fa-lock'></i>
                                  ))}{' '}
                            </div>

                            <div className='store-text'>
                              {' '}
                              <span className='span-2'>
                                {' '}
                                Cửa hàng{' '}
                                {this.props.shop[0] &&
                                  (this.props.shop[0].status === 'on'
                                    ? 'mở cửa'
                                    : 'đóng cửa')}{' '}
                                lúc{' '}
                              </span>
                              <span className='span-1'>
                                {' '}
                                {this.props.shop[0] &&
                                  startTime
                                    .tz('Asia/Vientiane')
                                    .format('hh:mm a')}{' '}
                              </span>{' '}
                              <span className='span-2'>ngày</span>
                              <span className='span-1'>
                                {' '}
                                {this.props.shop[0] &&
                                  startTime
                                    .tz('Asia/Vientiane')
                                    .format('DD-MM-YYYY')}
                              </span>
                            </div>
                            <div className='gradient-blueberry btn-store'>
                              {this.props.shop[0] &&
                                (this.props.shop[0].status === 'on' ? (
                                  <button
                                    type='button'
                                    onClick={() => this.changeShopStatus('off')}
                                    className='btn text-white m-1'
                                  >
                                    Đóng cửa
                                    <i className='fa fa-lock ml-2 fa-1x'></i>
                                  </button>
                                ) : (
                                    <button
                                      type='button'
                                      onClick={() => this.changeShopStatus('on')}
                                      className='btn text-white m-1'
                                      styles={{ float: 'right' }}
                                    >
                                      Mở cửa{' '}
                                      <i className='fa fa-unlock-alt ml-2 fa-1x'></i>
                                    </button>
                                  ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                    ' '
                  )}
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
                    rel='noopener noreferrer'
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

Dashboard.propTypes = {
  getAllAppointments: PropTypes.func.isRequired,
  getAllProducts: PropTypes.func.isRequired,
  getAllEvents: PropTypes.func.isRequired,
  getAllRentedProducts: PropTypes.func.isRequired,
  changeShopStatus: PropTypes.func.isRequired,
  getShop: PropTypes.func.isRequired,
  auth: PropTypes.object,
  products: PropTypes.array,
  orders: PropTypes.array,
  rentedproducts: PropTypes.array,
  shop: PropTypes.object,
};

const mapStateToProps = (state) => ({
  users: state.user.users,
  user: state.user.user,
  auth: state.auth,
  products: state.product.products,
  appointment: state.appointment.appointments,
  shop: state.dashboard.shop,
  rentedproducts: state.rentproduct.rentproducts,
  count_orders: state.rentproduct.get_count_order,
  events: state.events.events,
  b_events: state.events.birthdayevents,
  r_events: state.events.removedevents,
});
export default connect(mapStateToProps, {
  getAllAppointments,
  getAllProducts,
  getAllRentedProducts,
  changeShopStatus,
  getShop,
  getAllEvents,
  getUser,
  getAllBirthdayEvents,
  updateEvents,
  getremoveEvents,
  getDashboardCountOrders,
  // changeStatus,
  // getAllDashboardEvents
})(Dashboard);
