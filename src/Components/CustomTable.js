import React from 'react'
import AppColors from '../Utils/Colors'

// type Props = {
//     data : [],
//     onItemClick : any
// }

const CustomTable = ({ data, onItemClick }) => {
    return (
        <div className="col-lg-12 col-md-6 mb-md-0 mb-4">
            <div className="card">
                <div className="card-header pb-0">
                    <div className="row">
                        <div className="col-lg-6 col-7">
                            <h6>Projects</h6>
                            {/* <p className="text-sm mb-0">
                                <i className="fa fa-check text-info" aria-hidden="true"></i>
                                <span className="font-weight-bold ms-1">30 done</span> this month
                            </p> */}
                        </div>
                        {/* <div className="col-lg-6 col-5 my-auto text-end">
                            <div className="dropdown float-lg-end pe-4">
                                <a className="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-ellipsis-v text-secondary"></i>
                                </a>
                                <ul className="dropdown-menu px-2 py-3 ms-sm-n4 ms-n5" aria-labelledby="dropdownTable">
                                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Action</a></li>
                                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Another action</a></li>
                                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Something else here</a></li>
                                </ul>
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className="card-body px-0 pb-2">
                    <div className="table-responsive">
                        <table className="table align-items-center mb-0">
                            <thead>
                                <tr>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Members</th>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Budget</th>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Completion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((item, index) => {
                                    return (
                                        <tr>
                                            <td>
                                                <div className="ps-3 py-1">
                                                    <div className="d-flex flex-column justify-content-center">
                                                        <h6 className="mb-0 text-sm">{index + 1}</h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ps-3 py-1">
                                                    <div className="d-flex flex-column justify-content-center">
                                                        <h6 className="mb-0 text-sm">{item?.product_name}</h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ps-3 py-1">
                                                    <div className="d-flex flex-column">
                                                        <h6 className="mb-0 text-sm">Material XD Version</h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="progress-wrapper ps-3 py-1">
                                                    <div className="progress-info">
                                                        <div className="progress-percentage">
                                                            <span className="text-xs font-weight-bold">60%</span>
                                                        </div>
                                                    </div>
                                                    <div className="progress">
                                                        <div className="progress-bar bg-gradient-info w-60" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomTable