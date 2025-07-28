using Calendar.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Calendar.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index(string direction)
        {
            // Get current start of week from session or set to this Monday
            DateTime startOfWeek = HttpContext.Session.Get<DateTime>("StartOfWeek");
            if (startOfWeek == default)
            {
                DateTime today = DateTime.Today;
                int delta = DayOfWeek.Monday - today.DayOfWeek;
                startOfWeek = today.AddDays(delta);
            }

            // Adjust week if navigating
            switch (direction)
            {
                case "prev":
                    startOfWeek = startOfWeek.AddDays(-7);
                    break;
                case "next":
                    startOfWeek = startOfWeek.AddDays(7);
                    break;
                case "today":
                    DateTime today = DateTime.Today;
                    int delta = DayOfWeek.Monday - today.DayOfWeek;
                    startOfWeek = today.AddDays(delta);
                    break;
            }

            // Save updated week to session
            HttpContext.Session.Set("StartOfWeek", startOfWeek);

            // Generate week dates
            List<DateTime> weekDates = new List<DateTime>();
            for (int i = 0; i < 7; i++)
            {
                weekDates.Add(startOfWeek.AddDays(i));
            }

            ViewBag.WeekDates = weekDates;
            ViewBag.WeekRange = $"{weekDates[0]:dd MMM} – {weekDates[6]:dd MMM yyyy}";

            return View();
        }
    }

    // Session helper methods
    public static class SessionExtensions
    {
        public static void Set<T>(this ISession session, string key, T value)
        {
            session.SetString(key, System.Text.Json.JsonSerializer.Serialize(value));
        }

        public static T Get<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            return value == null ? default : System.Text.Json.JsonSerializer.Deserialize<T>(value);
        }
    }
}
