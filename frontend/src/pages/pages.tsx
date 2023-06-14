import React from "react";
import Page1 from "../components/page1";

export interface PageProps {
    changeNext : any,
    updatePage : any,
    updateParams : any
}


export class PAGE1 extends React.Component<{},{}>
{
    constructor(props:any)
    {
        super(props);
    }
    render(){
        return(
            <Page1/>
        )
    }
}