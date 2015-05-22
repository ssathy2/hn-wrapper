/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['hackernews-api-newyork1.siddsathyam.com', 'hn-wrapper'],
  /**
   * Your New Relic license key.
   */
  license_key : 'b19d8ec7ce268ddff1e3c93bacf42badb02f20ba',
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'info'
  }
};
