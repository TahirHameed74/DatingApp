import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {Image} from "semantic-ui-react";
import videoExtensions  from 'video-extensions';

export default class ChatBoxContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isUrl: props.content.includes("media/chat_files"),
            isVideo: videoExtensions.includes(props.content.split('.').pop()) ,
            content: props.content
        };
    }

    render() {
        const { user_id, recipient_id, showVideo } = this.props;
        const { content, isUrl, isVideo } = this.state;
        if (isUrl) {
            if(isVideo) {
                return (
                    <video height="100" onClick={() => showVideo(content)}>
                        <source src={content} />
                    </video>
                )
            } else {
                return (<a target="_blank" href={content}>
                    <Image
                        src={content}
                        style={{height: this.props.height, width: "auto"}}
                        onClick={this.props.onClick}
                        re
                    />
                </a>)
            }
        }
        return (
            <p
                style={{
                    color:
                        recipient_id !== user_id
                            ? recipient_id === null ? "" :  "#fff"
                            : "",
                    wordBreak: 'break-all'
                }}
            >

                {content.substring(0,150)}
            </p>
        );
    }
}

ChatBoxContent.defaultProps = {
    height: '100px',
    onclick: () => undefined
};

ChatBoxContent.propTypes = {
    content: PropTypes.string.isRequired,
    height: PropTypes.number,
    recipient_id: PropTypes.number,
    user_id: PropTypes.number,
};
