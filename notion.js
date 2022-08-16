const { Client } = require('@notionhq/client');

const notion = new Client({ auth: "secret_X352AdDE5zL6JTkTWC5nyjslIxS0o6pm3mJFrpJeNUU" });

module.exports = async function getQuery(pageId) {
  const response = await notion.blocks.retrieve({
    block_id: pageId,
  });
  return response;
};