import moment from 'moment';
import Header from '../organisms/Header';
import Hero from '../organisms/Hero';
import PostContent from '../organisms/PostContent';
import Comments from '../organisms/Comments';
import Footer from '../organisms/Footer';
import styles from '../stylesheets/Episode.module.css';

export default function Episode(props) {

    console.log(props.post)

    return (
        <div>
            <Header t={props.t} settings={props.settings}/>
            <Hero backgroundImage={props.post.feature_image}/>
            <div className={styles.contentArea}>
                <div className={styles.heading}>
                    <h1 className={styles.title}>{props.post.title}</h1>
                    <div className={styles.metaDetails}>
                        <a>{props.post.primary_tag.name}</a>
                        <span>•</span>
                        <span>{moment(props.post.published_at).format("MM-DD-YYYY")}</span>
                    </div>
                </div>
                <PostContent html={props.post.html}/>
                <Comments fullUrl={props.post.url} id={props.post.comment_id}/>
            </div>
            <Footer t={props.t}/>
        </div>
    );
}