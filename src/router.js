
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import SurveyManagement from './components/SurveyManagement/SurveyManagement.js';
import ResponseData from './components/ResponseData/ResponseData.js';
import CaseManagement from './components/CaseManagement/CaseManagement.js';


export default (
    <Switch>
        
        <Route component={ ResponseData } path='/' exact />
        <Route component={ SurveyManagement } path='/survey-management' exact />
        <Route component={ ResponseData } path='/response-data' exact />
        <Route component={ CaseManagement } path='/case-management' exact />

    </Switch>
)
