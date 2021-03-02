import React from 'react';

export default function ShowPrices({
  insuranceAmt,
  total,
  onChangePay,
  pay_amount,
  customer,
}) {
  return (
    <>
      <div className='col-md-12'>
        <div className='row'>
          <div className='col-md-4 '>
            <label className='text-center ml-2' id='setName'>
              Tổng Tiền (không cọc thêm)
            </label>
            <div>
              <input
                style={{ width: '65%', color: 'gray' }}
                type='text'
                value={Number(total) - Number(insuranceAmt)}
                className='form-control mm-input s-input text-center'
                placeholder='VNĐ'
                name='total_without_insurance'
                id='setSizeFloat'
                required
                readOnly
              />
            </div>
          </div>

          <div className='col-md-4 '>
            <label className='text-center ml-2' id='setName'>
              Cọc Thêm
            </label>
            <div>
              <input
                style={{ width: '65%', color: 'gray' }}
                type='text'
                value={Number(insuranceAmt)}
                className='form-control mm-input s-input text-center'
                placeholder='VNĐ'
                name='insurance'
                id='setSizeFloat'
                required
                readOnly
              />
            </div>
          </div>
          <div className='col-md-4 '>
            <label className='text-center ml-2' id='setName'>
              Tổng Tiền + Cọc Thêm
            </label>
            <div>
              <input
                style={{ width: '65%', color: 'gray' }}
                value={Number(total)}
                type='text'
                className='form-control mm-input s-input text-center'
                placeholder='Total'
                name='total_without_insurance'
                id='setSizeFloat'
                required
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className='col-md-12'>
        <div className='row'>
          <div className='col-md-4 '>
            <label className='text-center ml-2' id='setName'>
              Nợ
            </label>
            <div>
              <input
                style={{ width: '65%', color: 'gray' }}
                type='text'
                value={Number(total)}
                className='form-control mm-input s-input text-center'
                placeholder='Total'
                name='total_owe'
                id='setSizeFloat'
                required
                readOnly
              />
            </div>
          </div>

          <div className='col-md-4 '>
            <label className='text-center ml-2' id='setName'>
              Đã Trả
            </label>
            <div>
              <input
                style={{ width: '65%', color: 'gray' }}
                type='text'
                value={'0'}
                className='form-control mm-input s-input text-center'
                placeholder='Paid'
                required
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <br />
      <div className='col-md-12'>
        <div className='row '>
          <div className='mx-auto col-4 text-center'>
            <strong>{customer ? customer.name : ''}</strong> muốn thanh toán bao
            nhiêu tiền cho giao dịch ngày hôm nay?
            <div className='input-group mt-3'>
              <input
                type='number'
                min={0}
                name={'pay'}
                value={pay_amount}
                onChange={onChangePay}
                className='form-control border-primary'
              />
              <span class='input-group-addon p-1 px-2'>VNĐ</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
