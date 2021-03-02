const List = {
  list: [
    // {
    //   id: 0,
    //   title: "Trang chủ",
    //   url: "dashboard",
    //   icons: "ft-home",
    // },
    {
      id: 0,
      title: 'Mã giảm giá',
      url: 'coupons',
      icons: 'fa fa-gift',
      name: 'Admin',
    },
    {
      id: 1,
      title: 'Nhân Viên',
      url: 'user',
      icons: 'ft-users',
      name: 'Admin',
    },
    {
      id: 2,
      title: 'Hàng Kho',
      url: 'product',
      icons: 'ft-box',
      name: 'Inventory',
    },
    {
      id: 3,
      title: 'Barcode',
      url: 'barcode',
      icons: 'fa fa-barcode',
      name: 'Barcode',
    },
    {
      id: 4,
      title: 'Khách Hàng',
      url: 'customer',
      icons: 'fa fa-user',
      name: 'Customers',
    },
    {
      id: 5,
      title: 'Thuê Đồ',
      url: 'rentproduct',
      icons: 'icon-basket-loaded',
      name: 'Rentproduct',
    },
    {
      id: 6,
      title: 'Đơn Hàng',
      url: 'orders',
      icons: 'icon-bag',
      name: 'Orders',
    },
    {
      id: 7,
      title: 'Hẹn Thử Đồ',
      url: 'appointments',
      icons: 'ft-activity',
      name: 'Appointments',
    },
    {
      id: 8,
      title: 'Trả Đồ',
      url: 'returnproduct',
      icons: 'ft-activity',
      name: 'Returnproduct',
    },
    {
      id: 9,
      title: 'Lịch',
      url: 'calender',
      icons: 'ft-calendar',
      name: 'Calender',
    },
    {
      id: 10,
      title: 'Báo Cáo Thống Kê',
      url: 'reports',
      icons: 'ft-clipboard',
      name: 'Reports',
    },
  ],
  getList: function (user) {
    if (user && user.systemRole === 'Admin') {
      return (
        (localStorage.getItem(user._id) &&
          JSON.parse(localStorage.getItem(user._id))) ||
        this.list
      );
    } else if (user && user.systemRole === 'Employee') {
      const user_list = user && user.sections;
      const my_menu = [];
      for (let k = 0; k < this.list.length; k++) {
        if (user_list && user_list.includes(this.list[k].name)) {
          my_menu.push(this.list[k]);
        }
      }
      return (
        (localStorage.getItem(user._id) &&
          JSON.parse(localStorage.getItem(user._id))) ||
        my_menu
      );
    }
  },
  saveList: (list, user) => {
    if (!localStorage.getItem(user._id)) {
      const token = localStorage.getItem('token');
      localStorage.clear();
      localStorage.setItem('token', token);
      localStorage.setItem(user._id, JSON.stringify(list));
    }
    localStorage.setItem(user._id, JSON.stringify(list));
  },
};

export default List;
