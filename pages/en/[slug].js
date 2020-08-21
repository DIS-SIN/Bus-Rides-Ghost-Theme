import { getPost, getPage, getPosts, getTags, getSettings } from '../../Ghost-API/contentAPI';
import Episode from '../../components/templates/Episode';
import Page from '../../components/templates/Page';
import dictionary from '../../locales/en';
import ErrorPage from '../_error';

export default function Post(props) {

    if (props.error){
        return <ErrorPage errorCode={404} />
    }

    if (props.post){
        return <Episode t={dictionary} post={props.post} tags={props.tags} settings={props.settings} recommendedPosts={props.recommendedPosts}/>
    }

    return (
        <Page t={dictionary} page={props.page} tags={props.tags} settings={props.settings}/>
    );
}

Post.getInitialProps = async function({query, res}) {

    const props = new Object();

    props.post = await getPost(query.slug);
    props.settings = await getSettings();
    props.tags = await getTags(dictionary.getTopicSlugs);

    if (!props.post){

        props.page = await getPage(query.slug);

        if (!props.page){
            res.statusCode = 404
            return {error: true};
        }
    }
    else {
        props.recommendedPosts = await getPosts({
            limit: 3,
            filter: `tag:${dictionary.getGhostLocaleTag}+tags:[${Array.from(props.post.tags, tag => tag.slug)}]+id:-${props.post.id}`,
            include: "tags,authors",
        });
    }

	return {
        ...props,
        locale: dictionary.getLocale
    };
};