import React, { Fragment } from 'react'
import spinner from './spinner.gif'

export default () => (
    <Fragment>
        <img 
            src={spinner}
            style={{ width: '350px', margin: '200px auto', display: 'block' }}
            alt='Loading...'
        />
    </Fragment>
)
