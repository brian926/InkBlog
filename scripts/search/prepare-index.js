import path from 'path'
import { promises as fs } from 'fs'
import { globby } from 'globby'
import grayMatter from 'gray-matter'

(async function () {
    // prepare the dirs
    const srcDir = path.posix.join(process.cwd(), 'src')
    const publicDir = path.posix.join(process.cwd(), 'public')
    const contentBlogDir = path.posix.join(srcDir, 'content', 'blog')
    const contentFilePattern = path.posix.join(contentBlogDir, '*.md')
    const indexFile = path.posix.join(publicDir, 'search-index.json')
    const getSlugFromPathname = (pathname) => path.basename(pathname, path.extname(pathname))

    const contentFilePaths = await globby(['C:/Users/fatim/Code/InkBlog/src/content/blog/*'])
    console.log(contentBlogDir, contentFilePaths)
    if (contentFilePaths.length) {
        const files = contentFilePaths.map(async (filePath) => await fs.readFile(filePath, 'utf8'))
        const index = []
        let i = 0
        for await (let file of files) {
            const { data: { title, description, tags }, content } = grayMatter(file)
            index.push({
                slug: getSlugFromPathname(contentFilePaths[i]),
                category: 'blog',
                title,
                description,
                tags,
                body: content
            })
            i++
        }
        await fs.writeFile('C:/Users/fatim/Code/InkBlog/public/search-index.json', JSON.stringify(index))
        console.log(`Indexed ${index.length} documents from ${contentBlogDir} to ${indexFile}`)
    }

})();
