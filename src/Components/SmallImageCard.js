import React from 'react'

function SmallImageCard({title, subtitle}) {
  return (
    <div class="col-xl-3 col-sm-6">
      <div class="card">
        <div class="card-header p-3 pt-2">
          <div class="text-end pt-1">
            <h4 style={{textAlign:'left'}}>{title}</h4>
            <h5 class="mb-0">{subtitle}</h5>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmallImageCard